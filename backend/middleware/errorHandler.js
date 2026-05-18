// Global Error Handler Middleware

const { AppError } = require('../utils/errors');

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Wrong MongoDB ID Error
  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new AppError(message, 400);
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map(val => val.message)
      .join(', ');
    err = new AppError(message, 400);
  }

  // JWT Error
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid JWT token';
    err = new AppError(message, 401);
  }

  // JWT Expired Error
  if (err.name === 'TokenExpiredError') {
    const message = 'JWT token has expired';
    err = new AppError(message, 401);
  }

  // Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    err = new AppError(message, 409);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { error: err })
  });
};

module.exports = errorHandler;
