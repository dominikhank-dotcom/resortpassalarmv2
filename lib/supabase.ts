import { createClient } from '@supabase/supabase-js';

// Safe access to environment variables handling different environments
// This prevents "Cannot read properties of undefined" if import.meta.env is not available
const getEnv = (key: string) => {
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {
    console.warn('Error reading env var:', key, e);
  }
  return undefined;
};

// Nutzt VITE_ Prefix für Frontend-Variablen
const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel Environment Variables.');
}

// Initialize with placeholders if keys are missing to prevent immediate crash,
// operations will fail gracefully later.
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co', 
    supabaseAnonKey || 'placeholder'
);
