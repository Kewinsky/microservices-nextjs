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
const PORT = process.env.PORT || 3002;

// Konfiguracja Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  logger.error('Brak wymaganych zmiennych środowiskowych SUPABASE_URL lub SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger.requestLogger);

// Walidacja
const createItemValidation = [
  body('title').trim().notEmpty().withMessage('Tytuł jest wymagany').isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 1000 })
];

const updateItemValidation = [
  param('id').isUUID().withMessage('Nieprawidłowy format ID'),
  body('title').trim().notEmpty().withMessage('Tytuł jest wymagany').isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 1000 })
];

/**
 * POST /api/items
 * Utworzenie nowego rekordu
 */
app.post('/api/items', authenticateToken, createItemValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Błędne dane wejściowe',
        details: errors.array()
      });
    }

    const { title, description } = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('items')
      .insert({
        title,
        description: description || null,
        user_id: userId
      })
      .select()
      .single();

    if (error) {
      logger.error('Błąd podczas tworzenia rekordu:', error);
      return res.status(500).json({ error: 'Błąd podczas tworzenia rekordu' });
    }

    logger.info(`Rekord utworzony przez użytkownika ${userId}`);

    res.status(201).json({
      message: 'Rekord utworzony pomyślnie',
      item: data
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/items
 * Pobranie wszystkich rekordów użytkownika
 */
app.get('/api/items', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;

    const { data, error, count } = await supabase
      .from('items')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) {
      logger.error('Błąd podczas pobierania rekordów:', error);
      return res.status(500).json({ error: 'Błąd podczas pobierania rekordów' });
    }

    res.json({
      items: data || [],
      total: count || 0,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/items/:id
 * Pobranie pojedynczego rekordu
 */
app.get('/api/items/:id', authenticateToken, param('id').isUUID(), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Nieprawidłowy format ID',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Rekord nie znaleziony' });
      }
      logger.error('Błąd podczas pobierania rekordu:', error);
      return res.status(500).json({ error: 'Błąd podczas pobierania rekordu' });
    }

    res.json({ item: data });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/items/:id
 * Aktualizacja rekordu
 */
app.put('/api/items/:id', authenticateToken, updateItemValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Błędne dane wejściowe',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { title, description } = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('items')
      .update({
        title,
        description: description || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Rekord nie znaleziony' });
      }
      logger.error('Błąd podczas aktualizacji rekordu:', error);
      return res.status(500).json({ error: 'Błąd podczas aktualizacji rekordu' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Rekord nie znaleziony lub brak uprawnień' });
    }

    logger.info(`Rekord ${id} zaktualizowany przez użytkownika ${userId}`);

    res.json({
      message: 'Rekord zaktualizowany pomyślnie',
      item: data
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/items/:id
 * Usunięcie rekordu
 */
app.delete('/api/items/:id', authenticateToken, param('id').isUUID(), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Nieprawidłowy format ID',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('items')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      logger.error('Błąd podczas usuwania rekordu:', error);
      return res.status(500).json({ error: 'Błąd podczas usuwania rekordu' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Rekord nie znaleziony lub brak uprawnień' });
    }

    logger.info(`Rekord ${id} usunięty przez użytkownika ${userId}`);

    res.json({ message: 'Rekord usunięty pomyślnie' });
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
    service: 'crud-service',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`CRUD Service uruchomiony na porcie ${PORT}`);
});

