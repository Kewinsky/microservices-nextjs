import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { body, validationResult } from 'express-validator';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Konfiguracja Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  logger.error('Brak wymaganych zmiennych środowiskowych SUPABASE_URL lub SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Admin client do zarządzania użytkownikami
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Anon client do logowania (jeśli anon key dostępny)
const supabaseAnon = supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger.requestLogger);

// Walidacja danych
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Hasło musi mieć minimum 6 znaków'),
  body('name').optional().trim().isLength({ max: 100 })
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Hasło jest wymagane')
];

/**
 * POST /api/auth/register
 * Rejestracja nowego użytkownika
 */
app.post('/api/auth/register', registerValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Błędne dane wejściowe',
        details: errors.array()
      });
    }

    const { email, password, name } = req.body;

    // Utwórz użytkownika przez Supabase Admin API
    const { data: userData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Automatyczne potwierdzenie email
      user_metadata: {
        name: name || email.split('@')[0]
      }
    });

    if (authError) {
      // Sprawdź czy błąd wynika z istniejącego użytkownika
      if (authError.message?.includes('already registered') || authError.message?.includes('already exists')) {
        return res.status(400).json({ error: 'Użytkownik o tym adresie email już istnieje' });
      }
      logger.error('Błąd podczas rejestracji użytkownika:', authError);
      return res.status(500).json({ error: 'Błąd podczas rejestracji użytkownika' });
    }

    // Zwróć token JWT przez logowanie (używając anon client jeśli dostępny)
    let tokenData = null;
    if (supabaseAnon) {
      const { data, error: tokenError } = await supabaseAnon.auth.signInWithPassword({
        email,
        password
      });

      if (tokenError || !data.session) {
        logger.warn('Nie można wygenerować tokenu po rejestracji:', tokenError?.message);
        // Kontynuuj bez tokenu - użytkownik będzie musiał się zalogować
      } else {
        tokenData = data;
      }
    }

    logger.info(`Użytkownik zarejestrowany: ${email}`);

    const response = {
      message: tokenData 
        ? 'Użytkownik zarejestrowany pomyślnie' 
        : 'Użytkownik zarejestrowany pomyślnie. Proszę się zalogować.',
      user: {
        id: userData.user.id,
        email: userData.user.email,
        name: userData.user.user_metadata?.name || email.split('@')[0]
      }
    };

    if (tokenData?.session) {
      response.token = tokenData.session.access_token;
    }

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Logowanie użytkownika
 */
app.post('/api/auth/login', loginValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Błędne dane wejściowe',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Logowanie przez Supabase Auth (używamy anon client jeśli dostępny, w przeciwnym razie admin)
    const authClient = supabaseAnon || supabaseAdmin;
    const { data, error } = await authClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      logger.warn(`Nieudana próba logowania: ${email}`);
      return res.status(401).json({ error: 'Nieprawidłowy email lub hasło' });
    }

    if (!data.session) {
      return res.status(500).json({ error: 'Błąd podczas tworzenia sesji' });
    }

    logger.info(`Użytkownik zalogowany: ${email}`);

    res.json({
      message: 'Logowanie pomyślne',
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || email.split('@')[0]
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/verify
 * Weryfikacja tokenu JWT
 */
app.post('/api/auth/verify', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Brak tokenu autoryzacyjnego' });
    }

    const token = authHeader.split(' ')[1];

    // Weryfikacja tokenu przez Supabase (używamy admin client)
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ error: 'Nieprawidłowy lub wygasły token' });
    }

    res.json({
      valid: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name
      }
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
    service: 'auth-service',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Auth Service uruchomiony na porcie ${PORT}`);
});

