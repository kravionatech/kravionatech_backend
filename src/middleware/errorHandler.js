/**
 * Global Error Handler Middleware
 * Must be registered LAST in app.js (after all routes).
 *
 * Handles:
 *  - Mongoose ValidationError  → 400
 *  - Mongoose Duplicate Key (11000) → 409
 *  - Mongoose CastError (invalid ObjectId) → 400
 *  - Default → 500
 */

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, _next) => {
  // Mongoose field-level validation
  if (err.name === "ValidationError") {
    const errors = {};
    Object.keys(err.errors).forEach((field) => {
      errors[field] = [err.errors[field].message];
    });
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  // MongoDB duplicate key (e.g. unique slug / email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(409).json({
      success: false,
      message: `Duplicate entry — ${field} already exists`,
    });
  }

  // Mongoose CastError — invalid ObjectId
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  // JWT errors (surface as 401)
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token",
    });
  }

  // Default 500
  console.error("[ERROR]", err);
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    errors: {},
  });
};
