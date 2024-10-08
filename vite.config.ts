import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4000, 
    strictPort: false,
    host: true, 
    watch: {
      usePolling: true,
    },

  },
  define: {
    'process.env': {

    API_BASE_URL: 'http://localhost:3000',
    API2_BASE_URL: 'http://localhost:3000',
    FRONT_BASE_URL: 'http://localhost:4000',
  }
  }
});