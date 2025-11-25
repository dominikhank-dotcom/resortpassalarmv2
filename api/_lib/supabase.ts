import { createClient } from '@supabase/supabase-js';

export const getServiceSupabase = () => {
  // Im Backend (Node.js) ist process.env zuverlässig verfügbar
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey || !url) {
    throw new Error("Fehler: SUPABASE_SERVICE_ROLE_KEY oder URL fehlen in den Vercel Environment Variables.");
  }
  
  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};