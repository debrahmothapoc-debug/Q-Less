const { validationResult } = require("express-validator");

/** Collect express-validator errors and return 422 if any */
function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
}

/** Global error handler — mount last in Express */
function errorHandler(err, req, res, _next) {
  console.error("[ERROR]", err);
  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? "Internal server error." : err.message,
  });
}

module.exports = { validateRequest, errorHandler };
