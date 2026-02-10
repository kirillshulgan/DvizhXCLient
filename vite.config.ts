import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.shulgan-lab.ru', // Убедись, что твой API запускается на этом порту (http)
        changeOrigin: true,
        secure: false,
      },
      '/hubs': { // Для SignalR
        target: 'https://api.shulgan-lab.ru',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  }
})
