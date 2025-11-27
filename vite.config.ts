import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Warnlimit auf 1000kb erhöhen, um unnötige Warnungen bei moderater Größe zu vermeiden
    chunkSizeWarningLimit: 1000, 
    rollupOptions: {
      output: {
        // Manuelles Code-Splitting für bessere Performance
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['lucide-react', 'recharts'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
  server: {
    port: 3000,
  }
});