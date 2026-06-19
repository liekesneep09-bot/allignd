import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon-v2.png', 'apple-touch-icon-v4.png'],
      manifest: {
        id: '/',
        start_url: '/',
        name: 'Allignd',
        short_name: 'Allignd',
        description: 'Jouw cyclus, voeding en fitness in sync',
        theme_color: '#D4A5A5',
        background_color: '#FDF5F7',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'logo-192-v2.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'logo-512-v2.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 10485760
      }
    })
  ],
server: {
  proxy: {
    "/api": "http://localhost:3000",
  },
},

});
