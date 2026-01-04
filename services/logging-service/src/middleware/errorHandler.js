import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  if (err.message === 'request aborted' || err.code === 'ECONNRESET') {
    return;
  }

  if (res.headersSent) {
    return next(err);
  }

  logger.error('Error in Logging Service:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.message
    });
  }

  if (err.status === 401 || err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized'
    });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
};

