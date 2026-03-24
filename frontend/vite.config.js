import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['medical.png'],
      manifest: {
        name: 'Medical Care App',
        short_name: 'Medical',
        description: 'Your healthcare dashboard',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'medical.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'medical.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})