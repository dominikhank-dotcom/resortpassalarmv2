import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Helper to clean env vars (remove quotes often added by copy-paste or JSON stringify)
const cleanEnv = (val: string | undefined) => {
  if (!val) return '';
  let s = val.trim();
  // Remove wrapping double quotes
  if (s.startsWith('"') && s.endsWith('"')) {
    s = s.slice(1, -1);
  }
  // Remove wrapping single quotes
  if (s.startsWith("'") && s.endsWith("'")) {
    s = s.slice(1, -1);
  }
  return s;
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 1. Load variables from .env files (local development)
  const env = loadEnv(mode, (process as any).cwd(), '');

  // 2. Prioritize variables.
  // CRITICAL: On Vercel, variables are in 'process.env'.
  // We accept VITE_ or NEXT_PUBLIC_ prefixes.
  const processEnv = (process as any).env || {};

  const rawUrl = processEnv.VITE_SUPABASE_URL || 
                 processEnv.NEXT_PUBLIC_SUPABASE_URL || 
                 env.VITE_SUPABASE_URL || 
                 env.NEXT_PUBLIC_SUPABASE_URL || 
                 '';
                      
  const rawKey = processEnv.VITE_SUPABASE_ANON_KEY || 
                 processEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                 env.VITE_SUPABASE_ANON_KEY || 
                 env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                 '';

  const supabaseUrl = cleanEnv(rawUrl);
  const supabaseKey = cleanEnv(rawKey);

  // Debug Log for Build Logs (Visible in Vercel Dashboard)
  console.log('--- VITE BUILD CONFIG ---');
  console.log(`Supabase URL detected: ${supabaseUrl ? 'YES (Length: ' + supabaseUrl.length + ')' : 'NO'}`);
  console.log(`Supabase Key detected: ${supabaseKey ? 'YES' : 'NO'}`);

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
    server: {
      port: 3000,
    },
    // Define global constants replaced during build
    define: {
      '__SUPABASE_URL__': JSON.stringify(supabaseUrl),
      '__SUPABASE_ANON_KEY__': JSON.stringify(supabaseKey),
    }
  };
});