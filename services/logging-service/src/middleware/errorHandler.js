import { logger } from '../utils/logger.js';

/**
 * Centralny handler błędów
 */
export const errorHandler = (err, req, res, next) => {
  // Ignoruj błędy związane z przerwanymi połączeniami (request aborted)
  if (err.message === 'request aborted' || err.code === 'ECONNRESET') {
    return; // Nie loguj i nie odpowiadaj - klient już się rozłączył
  }

  // Sprawdź czy odpowiedź już została wysłana
  if (res.headersSent) {
    return next(err);
  }

  logger.error('Błąd w Logging Service:', {
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

