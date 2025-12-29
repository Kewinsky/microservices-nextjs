import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';
import axios from 'axios';
import { logger } from './utils/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Adresy mikroserwisów
const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const CRUD_SERVICE = process.env.CRUD_SERVICE_URL || 'http://localhost:3002';
const LOGGING_SERVICE = process.env.LOGGING_SERVICE_URL || 'http://localhost:3003';

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger.requestLogger);

/**
 * Funkcja pomocnicza do ekstrakcji userId z tokenu JWT
 */
const extractUserIdFromToken = (token) => {
  try {
    if (!token) return null;
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      Buffer.from(base64, 'base64')
        .toString()
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);
    return decoded.sub || decoded.user_id || null;
  } catch (error) {
    return null;
  }
};

/**
 * Middleware do logowania żądań do logging-service
 */
const logRequest = async (req, res, next) => {
  // Przechwytuj odpowiedź
  const originalSend = res.send;
  res.send = function(data) {
    res.send = originalSend;
    return originalSend.call(this, data);
  };

  // Loguj po zakończeniu żądania
  res.on('finish', async () => {
    try {
      const userId = req.headers.authorization 
        ? extractUserIdFromToken(req.headers.authorization.split(' ')[1])
        : null;

      await axios.post(`${LOGGING_SERVICE}/api/logs`, {
        user_id: userId,
        action: `${req.method} ${req.path}`,
        service: 'api-gateway',
        details: JSON.stringify({ 
          query: req.query, 
          statusCode: res.statusCode 
        }),
        ip_address: req.ip || req.connection.remoteAddress || 'unknown'
      }).catch(err => {
        logger.warn('Błąd podczas logowania do logging-service:', err.message);
      });
    } catch (error) {
      // Nie przerywaj żądania jeśli logowanie się nie powiodło
      logger.warn('Błąd w middleware logowania:', error.message);
    }
  });

  next();
};

/**
 * Proxy configuration dla Auth Service
 */
app.use('/api/auth', logRequest, createProxyMiddleware({
  target: AUTH_SERVICE,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/api/auth'
  },
  onProxyReq: (proxyReq, req) => {
    // Przekaż nagłówki
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }
  },
  onProxyRes: async (proxyRes, req, res) => {
    // Loguj sukces logowania/rejestracji
    if ((req.path === '/api/auth/login' || req.path === '/api/auth/register') && 
        (proxyRes.statusCode === 200 || proxyRes.statusCode === 201)) {
      let body = '';
      proxyRes.on('data', chunk => { body += chunk; });
      proxyRes.on('end', async () => {
        try {
          const data = JSON.parse(body);
          if (data.user) {
            await axios.post(`${LOGGING_SERVICE}/api/logs`, {
              user_id: data.user.id,
              action: req.path === '/api/auth/login' ? 'LOGIN' : 'REGISTER',
              service: 'auth-service',
              details: `User ${data.user.email}`,
              ip_address: req.ip || req.connection.remoteAddress || 'unknown'
            }).catch(err => logger.warn('Błąd logowania akcji:', err.message));
          }
        } catch (error) {
          logger.debug('Błąd parsowania odpowiedzi:', error.message);
        }
      });
    }
  },
  onError: (err, req, res) => {
    logger.error('Błąd proxy do Auth Service:', err.message);
    res.status(503).json({ error: 'Auth Service niedostępny' });
  }
}));

/**
 * Proxy configuration dla CRUD Service
 */
app.use('/api/items', logRequest, createProxyMiddleware({
  target: CRUD_SERVICE,
  changeOrigin: true,
  pathRewrite: {
    '^/api/items': '/api/items'
  },
  onProxyReq: (proxyReq, req) => {
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }
  },
  onProxyRes: async (proxyRes, req, res) => {
    // Loguj operacje CRUD
    if (proxyRes.statusCode >= 200 && proxyRes.statusCode < 300) {
      const userId = extractUserIdFromToken(req.headers.authorization?.split(' ')[1] || '');
      const action = `${req.method}_ITEM`;
      
      await axios.post(`${LOGGING_SERVICE}/api/logs`, {
        user_id: userId,
        action,
        service: 'crud-service',
        details: `${req.method} ${req.path}`,
        ip_address: req.ip || req.connection.remoteAddress || 'unknown'
      }).catch(err => logger.warn('Błąd logowania CRUD:', err.message));
    }
  },
  onError: (err, req, res) => {
    logger.error('Błąd proxy do CRUD Service:', err.message);
    res.status(503).json({ error: 'CRUD Service niedostępny' });
  }
}));

/**
 * Proxy configuration dla Logging Service
 */
app.use('/api/logs', logRequest, createProxyMiddleware({
  target: LOGGING_SERVICE,
  changeOrigin: true,
  pathRewrite: {
    '^/api/logs': '/api/logs'
  },
  onProxyReq: (proxyReq, req) => {
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }
  },
  onError: (err, req, res) => {
    logger.error('Błąd proxy do Logging Service:', err.message);
    res.status(503).json({ error: 'Logging Service niedostępny' });
  }
}));

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'api-gateway',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /health/all
 * Sprawdzenie statusu wszystkich serwisów
 */
app.get('/health/all', async (req, res) => {
  const services = {
    gateway: { status: 'ok', timestamp: new Date().toISOString() },
    auth: null,
    crud: null,
    logging: null
  };

  try {
    const [authRes, crudRes, loggingRes] = await Promise.allSettled([
      axios.get(`${AUTH_SERVICE}/health`, { timeout: 2000 }),
      axios.get(`${CRUD_SERVICE}/health`, { timeout: 2000 }),
      axios.get(`${LOGGING_SERVICE}/health`, { timeout: 2000 })
    ]);

    services.auth = authRes.status === 'fulfilled' 
      ? authRes.value.data 
      : { error: authRes.reason.message, status: 'down' };
    
    services.crud = crudRes.status === 'fulfilled' 
      ? crudRes.value.data 
      : { error: crudRes.reason.message, status: 'down' };
    
    services.logging = loggingRes.status === 'fulfilled' 
      ? loggingRes.value.data 
      : { error: loggingRes.reason.message, status: 'down' };
  } catch (error) {
    logger.error('Błąd sprawdzania serwisów:', error);
  }

  res.json(services);
});

app.listen(PORT, () => {
  logger.info(`API Gateway uruchomiony na porcie ${PORT}`);
  logger.info(`Auth Service: ${AUTH_SERVICE}`);
  logger.info(`CRUD Service: ${CRUD_SERVICE}`);
  logger.info(`Logging Service: ${LOGGING_SERVICE}`);
});

