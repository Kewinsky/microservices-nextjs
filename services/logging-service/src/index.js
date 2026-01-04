import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { body, param, validationResult, query } from 'express-validator';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';
import { authenticateToken } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  logger.error('Missing required environment variables SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

app.use(cors());
app.use(express.json());
app.use(logger.requestLogger.bind(logger));

const createLogValidation = [
  body('action').trim().notEmpty().withMessage('Action is required').isLength({ max: 100 }),
  body('service').trim().notEmpty().withMessage('Service is required').isLength({ max: 50 }),
  body('user_id').optional().isUUID(),
  body('details').optional(),
  body('ip_address').optional().isIP()
];

/**
 * POST /api/logs
 * Save a log (used by other services)
 * No authorization required - used internally
 */
app.post('/api/logs', createLogValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Invalid input data',
        details: errors.array()
      });
    }

    const { user_id, action, service, details, ip_address } = req.body;

    const { data, error } = await supabase
      .from('logs')
      .insert({
        user_id: user_id || null,
        action,
        service,
        details: details ? (typeof details === 'string' ? details : JSON.stringify(details)) : null,
        ip_address: ip_address || null
      })
      .select()
      .single();

    if (error) {
      logger.error('Error saving log:', error);
      return res.status(500).json({ error: 'Error saving log' });
    }

    res.status(201).json({
      message: 'Log saved successfully',
      log: data
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/logs
 * Get logs (requires authorization)
 */
app.get('/api/logs', authenticateToken, async (req, res, next) => {
  try {
    const { limit = 100, offset = 0, service, user_id } = req.query;
    const currentUserId = req.user.id;

    let query = supabase
      .from('logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (service) {
      query = query.eq('service', service);
    }

    if (user_id) {
      query = query.eq('user_id', user_id);
    } else {
      query = query.eq('user_id', currentUserId);
    }

    const { data, error, count } = await query;

    if (error) {
      logger.error('Error fetching logs:', error);
      return res.status(500).json({ error: 'Error fetching logs' });
    }

    res.json({
      logs: data || [],
      total: count || 0,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/logs/user/:userId
 * Get logs for a specific user
 */
app.get('/api/logs/user/:userId', authenticateToken, param('userId').isUUID(), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Invalid user ID format',
        details: errors.array()
      });
    }

    const { userId } = req.params;
    const currentUserId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;

    if (userId !== currentUserId) {
      return res.status(403).json({ error: 'Insufficient permissions to view this user\'s logs' });
    }

    const { data, error, count } = await supabase
      .from('logs')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) {
      logger.error('Error fetching user logs:', error);
      return res.status(500).json({ error: 'Error fetching logs' });
    }

    res.json({
      logs: data || [],
      total: count || 0,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'logging-service',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Logging Service running on port ${PORT}`);
});

