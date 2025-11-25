import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 1. Load variables from .env files (local development)
  // Casting process to any to avoid TS errors in some environments
  const env = loadEnv(mode, (process as any).cwd(), '');

  // 2. Prioritize variables.
  // CRITICAL: On Vercel, variables are often in 'process.env', not just 'env' object from loadEnv.
  // We must check process.env explicitly for NEXT_PUBLIC_ variables.
  const processEnv = (process as any).env || {};

  const supabaseUrl = env.VITE_SUPABASE_URL || 
                      processEnv.VITE_SUPABASE_URL ||
                      env.NEXT_PUBLIC_SUPABASE_URL || 
                      processEnv.NEXT_PUBLIC_SUPABASE_URL || 
                      '';
                      
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY || 
                      processEnv.VITE_SUPABASE_ANON_KEY ||
                      env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                      processEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                      '';

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