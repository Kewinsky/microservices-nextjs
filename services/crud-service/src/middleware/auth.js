import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Middleware do weryfikacji tokenu JWT z Supabase
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Brak tokenu autoryzacyjnego' });
    }

    const token = authHeader.split(' ')[1];

    // Weryfikacja tokenu przez Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      logger.warn('Nieprawidłowy token:', error?.message);
      return res.status(401).json({ error: 'Nieprawidłowy lub wygasły token' });
    }

    // Dodaj informacje o użytkowniku do requestu
    req.user = {
      id: user.id,
      email: user.email
    };

    next();
  } catch (error) {
    logger.error('Błąd w middleware autoryzacji:', error);
    res.status(500).json({ error: 'Błąd podczas weryfikacji tokenu' });
  }
};

