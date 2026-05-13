/**
 * Zod-based request body validation middleware.
 * Usage: router.post('/path', validate(zodSchema), handler)
 *
 * On failure returns 400 with fieldErrors in guideline format.
 * On success, req.body is replaced with the parsed (coerced) data.
 */

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors,
    });
  }

  req.body = result.data; // replace with coerced/sanitised data
  next();
};
