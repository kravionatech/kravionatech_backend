/**
 * Audit Log Middleware
 * Attaches a `finish` listener to the response — logs only on successful
 * requests (statusCode < 400) so error noise is excluded.
 *
 * Usage:
 *   import { auditLog } from "../middleware/audit.js";
 *   router.delete('/post/:slug', auth, roleCheck('admin'),
 *     auditLog('DELETE_POST', 'Post'), deletePost);
 */

import { AuditLogModel } from "../models/AuditLog.model.js";

export const auditLog = (action, resource) => async (req, res, next) => {
  res.on("finish", async () => {
    if (res.statusCode < 400) {
      try {
        await AuditLogModel.create({
          user: req.user?._id || req.user?.id,
          action,
          resource,
          resourceId: req.params?.id || req.params?.slug,
          ip: req.ip,
          userAgent: req.headers["user-agent"],
        });
      } catch (_e) {
        // Audit errors must never crash the request
        console.error("[AUDIT] Failed to write audit log:", _e.message);
      }
    }
  });
  next();
};
