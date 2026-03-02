// Centralized error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.message);

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
      error: "INVALID_TOKEN",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
      error: "TOKEN_EXPIRED",
    });
  }

  // Validation errors
  if (err.statusCode === 400) {
    return res.status(400).json({
      success: false,
      message: err.message,
      error: "VALIDATION_ERROR",
    });
  }

  // Not found errors
  if (err.statusCode === 404) {
    return res.status(404).json({
      success: false,
      message: err.message,
      error: "NOT_FOUND",
    });
  }

  // Unauthorized errors
  if (err.statusCode === 401) {
    return res.status(401).json({
      success: false,
      message: err.message,
      error: "UNAUTHORIZED",
    });
  }

  // Conflict errors (duplicate, etc.)
  if (err.statusCode === 409) {
    return res.status(409).json({
      success: false,
      message: err.message,
      error: "CONFLICT",
    });
  }

  // File size errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      success: false,
      message: "File size exceeds limit",
      error: "FILE_TOO_LARGE",
    });
  }

  // Default server error
  res.status(err.statusCode || 500).json({
    success: false,
    message: "An error occurred on the server",
    error: "SERVER_ERROR",
  });
};

// Async wrapper to catch errors in async routes
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
