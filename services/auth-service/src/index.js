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

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  logger.error('Missing required environment variables SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      'x-client-info': 'auth-service'
    }
  }
});
const supabaseAnon = supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

app.use(cors());
app.use(express.json());
app.use(logger.requestLogger.bind(logger));

const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').optional().trim().isLength({ max: 100 })
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

/**
 * POST /api/auth/register
 * Register a new user
 */
app.post('/api/auth/register', registerValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Invalid input data',
        details: errors.array()
      });
    }

    const { email, password, name } = req.body;

    logger.info(`Registration attempt for user: ${email}`);

    logger.debug('Calling supabase.auth.admin.createUser...');
    const createUserPromise = supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name: name || email.split('@')[0]
      }
    });
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout: Supabase did not respond within 15 seconds')), 15000)
    );
    
    let userData, authError;
    try {
      const result = await Promise.race([createUserPromise, timeoutPromise]);
      if (result && typeof result === 'object' && ('data' in result || 'error' in result)) {
        userData = result.data;
        authError = result.error;
        logger.debug('Response from createUser received');
      } else {
        throw new Error('Timeout: Invalid response from Supabase');
      }
    } catch (timeoutError) {
      logger.error('Timeout while creating user:', timeoutError.message);
      return res.status(504).json({ 
        error: 'Timeout: Authorization service did not respond in time',
        details: timeoutError.message
      });
    }

    if (authError) {
      if (authError.message?.includes('already registered') || authError.message?.includes('already exists')) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }
      logger.error('Error during user registration:', authError);
      return res.status(500).json({ error: 'Error during user registration' });
    }
    let tokenData = null;
    if (supabaseAnon) {
      logger.debug('Attempting login after registration...');
      try {
        const signInPromise = supabaseAnon.auth.signInWithPassword({
          email,
          password
        });
        
        const signInTimeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout during login')), 10000)
        );
        
        const { data, error: tokenError } = await Promise.race([signInPromise, signInTimeout]);

        if (tokenError || !data?.session) {
          logger.warn('Cannot generate token after registration:', tokenError?.message);
        } else {
          tokenData = data;
          logger.debug('Token generated successfully');
        }
      } catch (tokenErr) {
        logger.warn('Error during token generation:', tokenErr.message);
      }
    } else {
      logger.debug('No anon key - skipping token generation');
    }

    logger.info(`User registered: ${email}`);

    const response = {
      message: tokenData 
        ? 'User registered successfully' 
        : 'User registered successfully. Please log in.',
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
 * User login
 */
app.post('/api/auth/login', loginValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Invalid input data',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    const authClient = supabaseAnon || supabaseAdmin;
    const { data, error } = await authClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      logger.warn(`Failed login attempt: ${email}`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!data.session) {
      return res.status(500).json({ error: 'Error creating session' });
    }

    logger.info(`User logged in: ${email}`);

    res.json({
      message: 'Login successful',
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
 * Verify JWT token
 */
app.post('/api/auth/verify', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    const token = authHeader.split(' ')[1];

    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
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
  logger.info(`Auth Service running on port ${PORT}`);
});

