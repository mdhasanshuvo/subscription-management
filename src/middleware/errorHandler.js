const { formatErrorResponse } = require('../utils/responseFormatter');

/**
 * Central error handling middleware
 * All errors should be passed to next() with error object
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json(
      formatErrorResponse('Validation failed', 400, { errors: messages })
    );
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json(
      formatErrorResponse(`${field} already exists`, 400)
    );
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    return res.status(400).json(
      formatErrorResponse('Invalid ID format', 400)
    );
  }

  // Custom business logic error
  if (err.statusCode) {
    return res.status(err.statusCode).json(
      formatErrorResponse(err.message, err.statusCode, err.data)
    );
  }

  // Default server error
  return res.status(500).json(
    formatErrorResponse(
      process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
      500
    )
  );
};

/**
 * 404 handler - should be last middleware
 */
const notFoundHandler = (req, res) => {
  res.status(404).json(
    formatErrorResponse(
      `Route ${req.originalUrl} not found`,
      404
    )
  );
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
