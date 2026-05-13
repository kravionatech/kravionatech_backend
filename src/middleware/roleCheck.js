/**
 * roleCheck middleware
 * Usage: roleCheck('admin') or roleCheck('admin', 'super_admin')
 * Must be used AFTER authMiddleWare so req.user is populated.
 */
const roleCheck = (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access forbidden",
      });
    }
    next();
  };

export default roleCheck;
