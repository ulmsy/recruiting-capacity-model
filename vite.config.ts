import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Set base to '/recruiting-capacity-model/' for GitHub Pages
// or leave as '/' for Vercel / local dev
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH ?? '/recruiting-capacity-model/',
});
