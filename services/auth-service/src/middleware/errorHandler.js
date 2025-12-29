import { logger } from '../utils/logger.js';

/**
 * Centralny handler błędów
 */
export const errorHandler = (err, req, res, next) => {
  logger.error('Błąd w Auth Service:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Błąd walidacji
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Błąd walidacji',
      details: err.message
    });
  }

  // Błąd autoryzacji
  if (err.status === 401 || err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Brak autoryzacji'
    });
  }

  // Domyślny błąd serwera
  res.status(err.status || 500).json({
    error: err.message || 'Wewnętrzny błąd serwera'
  });
};

