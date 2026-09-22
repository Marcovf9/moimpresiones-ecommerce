/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Los tests corren en jsdom: hay componentes que leen localStorage y el DOM.
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: false,
  },
  server: {
    port: 5173,
    proxy: {
      // El backend de Spring Boot atiende en 8080 durante el desarrollo.
      '/api': 'http://localhost:8080',
      '/media': 'http://localhost:8080',
    },
  },
})
