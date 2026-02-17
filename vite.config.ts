import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: 
  [
    react(),
    VitePWA({ 
      registerType: 'autoUpdate', // Автоматическое обновление сервис-воркера
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'], // Твои иконки
      manifest: {
        name: 'DvizhX Kanban',
        short_name: 'DvizhX',
        description: 'Управление задачами и событиями',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone', // Чтобы открывалось как отдельное приложение (без адресной строки)
        orientation: 'portrait', // Можно зафиксировать или оставить 'any'
        icons: [
          {
            src: 'pwa-192x192.png', // Сгенерируй эти иконки (см. ниже)
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' // Для круглых иконок Android
          }
        ]
      },
      devOptions: {
        enabled: true, // Включаем генерацию манифеста и SW в dev-режиме
        type: 'module', // Важно для TypeScript/ESM
      }
    })
  ],
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
