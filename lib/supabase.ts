import { createClient } from '@supabase/supabase-js';

// Robust environment variable retrieval
let supabaseUrl = '';
let supabaseAnonKey = '';

// 1. Try Vite Standard (import.meta.env)
try {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    // @ts-ignore
    supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  }
} catch (e) {
  console.warn("Vite env access failed", e);
}

// 2. Try Vercel/Process Standard (process.env) via direct access to allow bundler replacement
if (!supabaseUrl || !supabaseAnonKey) {
  try {
    // We access properties directly so Vite 'define' plugin can replace them with strings
    // @ts-ignore
    const processUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    // @ts-ignore
    const processKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    supabaseUrl = supabaseUrl || processUrl || '';
    supabaseAnonKey = supabaseAnonKey || processKey || '';
  } catch (e) {
    // process might be undefined
  }
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase Configuration missing. Check VITE_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL.");
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);

// Backend Client (Only for API Routes)
export const getServiceSupabase = () => {
  // In Node environment (Vercel Functions), process.env is reliable
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey || !url) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL in backend env.");
  }
  return createClient(url, serviceRoleKey);
};