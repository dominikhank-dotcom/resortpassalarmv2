import { createClient } from '@supabase/supabase-js';

export const getServiceSupabase = () => {
  // In Node environment (Vercel Functions), process.env is reliable
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey || !url) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL in backend env.");
  }
  return createClient(url, serviceRoleKey);
};