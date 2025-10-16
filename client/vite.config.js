import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  define: {
    __API_BASE__: JSON.stringify(process.env.VITE_API_BASE_URL || 'http://localhost:5000'),
  },
});
