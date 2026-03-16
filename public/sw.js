// Service Worker for PWA
// Keep cache strategy conservative to avoid stale JS/CSS after deploys.
const CACHE_NAME = 'lumiere-shell-v1';
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL_URLS);
    })
  );
  self.skipWaiting();
});

// Activate event - cleanup old app shell caches and claim clients.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith('lumiere-shell-') && cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network-first for navigations, avoid JS/CSS response caching.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isDocument = event.request.mode === 'navigate';

  if (event.request.method !== 'GET' || !isSameOrigin) {
    return;
  }

  if (!isDocument) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', responseToCache));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match('/index.html');
        return cached || caches.match('/');
      })
  );
});
