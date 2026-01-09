import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
const isVercel = Boolean(process.env.VERCEL);

export default defineConfig({
  plugins: [react()],
  base: isVercel ? '/' : '/devsecops-ci-cd-gates/', // Vercel vs GitHub Pages
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
