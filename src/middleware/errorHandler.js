const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  logger.error('Unhandled error:', err.message);
  if (process.env.NODE_ENV === 'development') {
    logger.error(err.stack);
  }

  const statusCode = err.statusCode || 500;

  if (req.accepts('html')) {
    res.status(statusCode).render('pages/error', {
      title: 'Error',
      message: statusCode === 500
        ? 'Something went wrong. Please try again later.'
        : err.message,
      statusCode,
      layout: 'layouts/main',
    });
  } else {
    res.status(statusCode).json({
      error: statusCode === 500 ? 'Internal Server Error' : err.message,
    });
  }
}

function notFoundHandler(req, res) {
  res.status(404).render('pages/error', {
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.',
    statusCode: 404,
    layout: 'layouts/main',
  });
}

module.exports = { errorHandler, notFoundHandler };
