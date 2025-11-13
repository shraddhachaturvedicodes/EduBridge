// server/middleware/errorHandler.js

// 404 handler for API routes (mounted on /api)
function notFoundHandler(req, res, next) {
  // If it's an API call, return JSON 404
  if (req.originalUrl && req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({ error: 'API Route Not Found.' });
  }
  // otherwise let it fall through to next (maybe static or frontend)
  next();
}

// Global error handler middleware (final handler)
function errorHandler(err, req, res, next) {
  // Log error server-side with stack when available
  console.error('Unhandled error:', err && (err.stack || err.message) ? (err.stack || err.message) : err);

  // If client expects JSON (API), respond JSON
  if (req.originalUrl && req.originalUrl.startsWith('/api/')) {
    const status = err && err.statusCode ? err.statusCode : 500;
    const msg = err && err.message ? err.message : 'Internal Server Error';
    return res.status(status).json({ error: msg });
  }

  // Fallback: plain text
  res.status(500).send('Internal Server Error');
}

module.exports = { notFoundHandler, errorHandler };
