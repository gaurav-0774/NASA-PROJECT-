// middleware/errorHandler.js
// Global error handling middleware for AstroVitals Express API.
// Catches unhandled errors and returns consistent JSON responses.

function errorHandler(err, req, res, next) {
  console.error(`[Error] ${req.method} ${req.url}:`, err.message);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: {
      status: statusCode,
      message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    }
  });
}

module.exports = errorHandler;
