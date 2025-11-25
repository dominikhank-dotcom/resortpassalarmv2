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

  // Clean strings
  if (url === '""' || url === "''") url = '';
  if (key === '""' || key === "''") key = '';

  // 2. Try Runtime Variables (Development / Fallback)
  if (!url || !key) {
    try {
      // Cast to any to avoid TypeScript errors with import.meta
      const meta = import.meta as any;
      const env = meta.env || {};
      
      if (!url) url = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || '';
      if (!key) key = env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    } catch (e) {}
  }

  return { url, key };
};

const config = getSupabaseConfig();

// Fallback to prevent crash ("White Screen") if config is missing
// This allows the app to render the Login screen (where auth will fail gracefully with an error message)
// instead of throwing an Uncaught Exception in the root.
const isConfigMissing = !config.url || !config.key;
const validUrl = isConfigMissing ? 'https://placeholder.supabase.co' : config.url;
const validKey = isConfigMissing ? 'placeholder' : config.key;

if (isConfigMissing) {
  console.warn("⚠️ Supabase Configuration missing in Client.");
  if (typeof window !== 'undefined') {
    // Log to console for developer visibility
    console.log("Please check Vercel Settings -> Environment Variables. Ensure NEXT_PUBLIC_SUPABASE_URL is set.");
  }
}

export const supabase = createClient(validUrl, validKey);