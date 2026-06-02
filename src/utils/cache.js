/**
 * cache.js — Redis-compatible caching layer with in-memory fallback.
 *
 * Production: uses `redis` package if REDIS_URL is set.
 * Development/test: uses an in-memory Map with TTL so the API still
 *                   responds quickly even without Redis running.
 *
 * Spec (Section 12) — public route TTLs:
 *   site-config        10 min
 *   services           5 min
 *   services/nav       30 min
 *   team               5 min
 *   portfolio          5 min
 *   testimonials       5 min
 *   pricing            10 min
 */

// ─────────────────────────────────────────────────────────────
// In-memory cache (always available as fallback)
// ─────────────────────────────────────────────────────────────
class MemoryCache {
  constructor() { this.store = new Map(); }
  set(key, value, ttlSeconds) {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.store.set(key, { value, expiresAt });
  }
  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }
  del(key) { this.store.delete(key); }
  delByPrefix(prefix) {
    for (const k of [...this.store.keys()]) {
      if (k.startsWith(prefix)) this.store.delete(k);
    }
  }
  keys() { return [...this.store.keys()]; }
}

const memCache = new MemoryCache();

// ─────────────────────────────────────────────────────────────
// Optional Redis client (lazy-connect)
// ─────────────────────────────────────────────────────────────
let redisClient = null;
let redisReady = false;

const initRedis = async () => {
  if (redisReady || redisClient) return;
  if (!process.env.REDIS_URL) return;
  try {
    const { createClient } = await import("redis");
    redisClient = createClient({ url: process.env.REDIS_URL });
    redisClient.on("error", (e) => {
      console.error("[REDIS] error:", e.message);
      redisReady = false;
    });
    await redisClient.connect();
    redisReady = true;
    console.log("✅ Redis connected");
  } catch (e) {
    console.warn("[REDIS] not available, using in-memory cache:", e.message);
    redisClient = null;
    redisReady = false;
  }
};

// Initialize Redis once on first import (non-blocking)
initRedis().catch(() => {});

// ─────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────

/** Read a cached value; returns null on miss */
export const cacheGet = async (key) => {
  if (redisReady && redisClient) {
    try {
      const v = await redisClient.get(key);
      if (v) {
        try { return JSON.parse(v); } catch { return v; }
      }
      return null;
    } catch { /* fall through */ }
  }
  return memCache.get(key);
};

/** Write a value with a TTL (in seconds) */
export const cacheSet = async (key, value, ttlSeconds) => {
  if (redisReady && redisClient) {
    try {
      const payload = typeof value === "string" ? value : JSON.stringify(value);
      if (ttlSeconds) await redisClient.set(key, payload, { EX: ttlSeconds });
      else await redisClient.set(key, payload);
      return;
    } catch { /* fall through */ }
  }
  memCache.set(key, value, ttlSeconds);
};

/** Delete a single key */
export const cacheDel = async (key) => {
  if (redisReady && redisClient) {
    try { await redisClient.del(key); } catch { /* ignore */ }
  }
  memCache.del(key);
};

/**
 * Delete all keys matching a prefix.
 * Note: Redis SCAN is used to avoid blocking the server on KEYS.
 */
export const cacheDelByPrefix = async (prefix) => {
  if (redisReady && redisClient) {
    try {
      let cursor = 0;
      do {
        const reply = await redisClient.scan(cursor, { MATCH: `${prefix}*`, COUNT: 100 });
        cursor = reply.cursor;
        if (reply.keys.length) {
          await redisClient.del(reply.keys);
        }
      } while (cursor !== 0);
    } catch (e) {
      console.error("[CACHE] Redis delByPrefix failed:", e.message);
    }
  }
  memCache.delByPrefix(prefix);
};

/**
 * Cache key registry — keep cache-invalidation logic in one place.
 */
export const CACHE_KEYS = {
  siteConfig: "cache:site-config",
  services: "cache:services",
  servicesNav: "cache:services-nav",
  team: "cache:team",
  portfolio: "cache:portfolio",
  portfolioFeatured: "cache:portfolio-featured",
  testimonials: "cache:testimonials",
  testimonialsFeatured: "cache:testimonials-featured",
  pricing: "cache:pricing",
};

/**
 * Invalidate every cache key relevant to a route.
 * Pass one of: 'site-config' | 'services' | 'team' | 'portfolio' |
 *              'testimonials' | 'pricing' | 'all'
 */
export const invalidateCache = async (scope) => {
  if (scope === "all") {
    for (const k of Object.values(CACHE_KEYS)) await cacheDel(k);
    return;
  }
  const key = CACHE_KEYS[scope];
  if (key) await cacheDel(key);
};

/**
 * Higher-order helper: cache a public GET handler's JSON response.
 *
 *   router.get('/public/site-config', cache('site-config', 600), handler);
 *
 * On hit: send cached body with header `x-cache: HIT`.
 * On miss: run handler, capture res.json() body, store it, send.
 */
export const cacheMiddleware = (scope, ttlSeconds) => {
  const key = CACHE_KEYS[scope] || `cache:${scope}`;
  return async (req, res, next) => {
    try {
      const hit = await cacheGet(key);
      if (hit !== null && hit !== undefined) {
        res.set("x-cache", "HIT");
        return res.status(200).json(hit);
      }
    } catch { /* fall through */ }

    // Wrap res.json to capture + cache the response
    const origJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheSet(key, body, ttlSeconds).catch(() => {});
      }
      res.set("x-cache", "MISS");
      return origJson(body);
    };
    next();
  };
};
