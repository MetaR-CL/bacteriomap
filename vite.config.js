import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const SUPABASE_HOST = 'mqobermcwxxxkbovizua.supabase.co';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // manifest.json is already hand-authored in /public and linked from index.html.
      manifest: false,
      includeAssets: [
        'favicon.ico', 'favicon-16x16.png', 'favicon-32x32.png',
        'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'maskable-512.png',
      ],
      workbox: {
        // Precache the app shell (hashed JS/CSS bundles + index.html) so the
        // installed PWA opens instantly on repeat launches, offline included.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/bacteriomap/index.html',
        runtimeCaching: [
          {
            // Bacteria/system/pathologie photos — rarely change, safe to serve
            // from cache first and refresh in the background.
            urlPattern: ({ url }) => url.host === SUPABASE_HOST && url.pathname.includes('/storage/v1/object/public/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'bacteriomap-images',
              expiration: { maxEntries: 300, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Content API calls — network first (fresh data when online),
            // falls back to the last cached response when offline/slow.
            urlPattern: ({ url }) => url.host === SUPABASE_HOST && url.pathname.startsWith('/rest/v1/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'bacteriomap-api',
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  base: '/bacteriomap/',
  build: {
    target: 'es2020',
  },
});
