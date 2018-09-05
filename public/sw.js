const version = '0.1.7';
const cacheName = `offline-notepad-${version}`;

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache
        .addAll([
          '/',
          'index.html',
          `runtime.js`,
          `polyfills.js`,
          `styles.js`,
          'vendor.js',
          `main.js`,
          `assets/css/font-awesome.min.css`,
          'assets/js/pouchdb.min.js',
        ])
        .then(() => self.skipWaiting());
    }),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches
      .open(cacheName)
      .then((cache) => cache.match(event.request, { ignoreSearch: true }))
      .then((response) => {
        return response || fetch(event.request);
      }),
  );
});
