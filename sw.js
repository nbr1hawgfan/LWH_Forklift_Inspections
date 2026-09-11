// Minimal app-shell cache so the form loads even with no connection.
// Bump CACHE_NAME whenever you change index.html/admin.html so clients pick up the update.
const CACHE_NAME = 'forklift-inspection-v11';
const ASSETS = [
  './',
  './index.html',
  './admin.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/signature_pad/4.1.5/signature_pad.umd.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// Network-first for the GAS API calls (never serve stale data from cache),
// cache-first for everything else (the app shell).
self.addEventListener('fetch', event => {
  const url = event.request.url;
  if (url.includes('script.google.com')) {
    return; // let it hit the network directly; app handles offline queuing itself
  }
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
