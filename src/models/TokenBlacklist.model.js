import mongoose from "mongoose";

/**
 * TokenBlacklist Model — Auth Upgrades
 * Stores invalidated JWT refresh tokens after logout.
 * TTL: tokens auto-expire at their natural JWT expiry.
 */
const tokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  expiresAt: {
    type: Date,
    required: true,
  },
});

// TTL — MongoDB removes docs once expiresAt has passed
tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
tokenBlacklistSchema.index({ token: 1 });

export const TokenBlacklistModel =
  mongoose.models.TokenBlacklist ||
  mongoose.model("TokenBlacklist", tokenBlacklistSchema);
