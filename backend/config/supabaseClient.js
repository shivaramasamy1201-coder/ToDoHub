import { createClient } from '@supabase/supabase-js';

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load frontend env as fallback if not in backend env
dotenv.config({ path: path.resolve(__dirname, '../../frontend/.env') });

const getSupabaseConfig = () => {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase credentials missing in backend environment variables.');
  }

  return { supabaseUrl, supabaseKey };
};

/**
 * Create a Supabase client scoped to an authenticated user request
 * @param {string} [authToken] - User JWT token from Authorization header
 */
export const getAuthenticatedSupabaseClient = (authToken) => {
  const { supabaseUrl, supabaseKey } = getSupabaseConfig();

  if (!supabaseUrl) {
    throw new Error('Server configuration error: SUPABASE_URL environment variable is not set on the backend.');
  }
  if (!supabaseKey) {
    throw new Error('Server configuration error: SUPABASE_ANON_KEY environment variable is not set on the backend.');
  }

  const options = {};
  if (authToken) {
    options.global = {
      headers: {
        Authorization: authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`
      }
    };
  }

  return createClient(supabaseUrl, supabaseKey, options);
};
