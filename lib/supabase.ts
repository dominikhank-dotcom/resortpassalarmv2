import { createClient } from '@supabase/supabase-js';

// Global variables defined in vite.config.ts
declare const __SUPABASE_URL__: string;
declare const __SUPABASE_ANON_KEY__: string;

const getSupabaseConfig = () => {
  let url = '';
  let key = '';

  // 1. Try injected build variables (Best for Vercel)
  try {
    if (typeof __SUPABASE_URL__ !== 'undefined') url = __SUPABASE_URL__;
    if (typeof __SUPABASE_ANON_KEY__ !== 'undefined') key = __SUPABASE_ANON_KEY__;
  } catch (e) {}

  // 2. Try Runtime Variables (Development / Fallback)
  if (!url || !key) {
    try {
      const meta = import.meta as any;
      const env = meta.env || {};
      
      if (!url) url = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || '';
      if (!key) key = env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    } catch (e) {}
  }

  // Robust cleanup: Remove surrounding quotes and whitespace
  const clean = (str: string) => {
      if (!str) return '';
      let s = str.trim();
      // Remove quotes recursively
      while ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
          s = s.slice(1, -1);
      }
      return s;
  }

  url = clean(url);
  key = clean(key);

  // Protocol check
  if (url && !url.startsWith('http')) {
      url = 'https://' + url;
  }

  return { url, key };
};

const config = getSupabaseConfig();

// Check if config is missing or placeholder
export const isSupabaseConfigured = !!config.url && !!config.key && !config.url.includes('placeholder');

// Debug Output in Browser Console
if (typeof window !== 'undefined') {
    console.log(`[Supabase Init] URL: ${config.url ? config.url.substring(0, 15) + '...' : 'Missing'} (Valid: ${isSupabaseConfigured ? 'Yes' : 'No'})`);
}

const validUrl = config.url || 'https://placeholder.supabase.co';
const validKey = config.key || 'placeholder';

if (!isSupabaseConfigured) {
  console.warn("⚠️ Supabase Configuration missing in Client.");
  if (typeof window !== 'undefined') {
    console.log("Please check Vercel Settings -> Environment Variables. Ensure NEXT_PUBLIC_SUPABASE_URL is set and redeploy.");
  }
}

export const supabase = createClient(validUrl, validKey);