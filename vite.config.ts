import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// The marketing landing page owns "/", the tenant app lives under "/tenant/".
// In dev, send deep links like /tenant/purchase to the app's index.html so
// React Router can handle them (production hosts need the same rewrite).
const rewriteTenant = (req: { url?: string }, _res: unknown, next: () => void) => {
  const url = req.url ?? '';
  if (url.startsWith('/tenant') && !url.includes('.') && !url.startsWith('/tenant/@')) {
    req.url = '/tenant/index.html';
  }
  next();
};
const tenantSpaFallback = (): Plugin => ({
  name: 'tenant-spa-fallback',
  configureServer(server) {
    server.middlewares.use(rewriteTenant);
  },
  configurePreviewServer(server) {
    server.middlewares.use(rewriteTenant);
  }
});

// The web app manifest belongs to the tenant app, not the landing page.
const landingWithoutManifest = (): Plugin => ({
  name: 'landing-without-manifest',
  enforce: 'post',
  transformIndexHtml: {
    order: 'post',
    handler(html, ctx) {
      if (ctx.path !== '/index.html') return html;
      return html.replace(/\s*<link rel="manifest"[^>]*>/, '');
    }
  }
});

export default defineConfig({
  plugins: [
    tenantSpaFallback(),
    react(),
    // The tenant app's service worker is scoped to /tenant/ and registered from
    // the app itself, so it can never serve the landing page. /sw.js is a
    // clean-up worker (public/sw.js) for browsers still holding the old
    // root-scoped worker.
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      filename: 'tenant-sw.js',
      scope: '/tenant/',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      workbox: {
        globIgnores: ['sw.js', 'index.html', 'landing/**'],
        navigateFallback: '/tenant/index.html',
        navigateFallbackAllowlist: [/^\/tenant/]
      },
      manifest: {
        name: 'Smata Water App',
        short_name: 'Smata',
        description: 'Smart water management system',
        theme_color: '#3b82f6',
        start_url: '/tenant/',
        scope: '/tenant/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    }),
    landingWithoutManifest()
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        tenant: resolve(__dirname, 'tenant/index.html')
      }
    }
  }
});
