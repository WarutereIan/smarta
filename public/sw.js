// Clean-up worker. Before the landing page moved to "/", the tenant app
// registered a service worker here for the whole site, and it keeps serving
// the old app (which redirects to /auth) to returning visitors. Browsers
// fetch this file to update that worker; this version clears its cache,
// unregisters itself and reloads open pages from the network. The tenant
// app now uses /tenant-sw.js, scoped to /tenant/.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const scope = self.registration.scope;
    const keys = await caches.keys();
    // workbox names its caches after the registration scope; the tenant app's end in /tenant/
    await Promise.all(keys.filter((k) => k.endsWith(scope)).map((k) => caches.delete(k)));
    await self.registration.unregister();
    const oldRoutes = /^\/(auth|purchase|bills|profile)(\/|$)/;
    const windows = await self.clients.matchAll({ type: 'window' });
    windows.forEach((client) => {
      const url = new URL(client.url);
      if (oldRoutes.test(url.pathname)) url.pathname = '/tenant' + url.pathname;
      client.navigate(url.href);
    });
  })());
});
