import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // 👉 ajoute cette ligne

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // 👉 ajoute l’alias
    },
  },
})
