import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      // El backend de Spring Boot atiende en 8080 durante el desarrollo.
      '/api': 'http://localhost:8080',
      '/media': 'http://localhost:8080',
    },
  },
})
