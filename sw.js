// Self-destructing service worker v8 — clears all caches, forces reload, unregisters
const V = 'v8';
self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.matchAll({ includeUncontrolled: true, type: 'window' }))
      .then(clients => {
        clients.forEach(c => c.navigate ? c.navigate(c.url) : c.postMessage({ type: 'RELOAD', v: V }));
        return self.registration.unregister();
      })
  );
  self.clients.claim();
});
self.addEventListener('fetch', e => e.respondWith(fetch(e.request)));
