// Service Worker — safe, static-first caching (Cloudflare Pages friendly)
// Notes:
// - Caches only same-origin GET requests.
// - Navigation requests: network-first with offline fallback.
// - Static assets: cache-first.

const CACHE_VERSION = '2025-12-07';
const CACHE_NAME = `roman-engineer-${CACHE_VERSION}`;

const PRECACHE = [
  'styles.css',
  'script.js',
  'manifest.json',
  'offline.html',
  'assets/asset-0.jpeg',
  'assets/asset-10.jpeg',
  'assets/asset-27.gif',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'assets/icon-192-maskable.png',
  'assets/icon-512-maskable.png',
  'assets/apple-touch-icon.png',
  'assets/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const requests = PRECACHE.map((p) => new Request(new URL(p, self.registration.scope), { cache: 'reload' }));
    await cache.addAll(requests);
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : Promise.resolve())));
    self.clients.claim();
  })());
});

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  const res = await fetch(request);
  if (res && res.ok) {
    cache.put(request, res.clone());
  }
  return res;
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const res = await fetch(request);
    if (res && res.ok) {
      cache.put(request, res.clone());
    }
    return res;
  } catch (_) {
    const cached = await cache.match(request);
    if (cached) return cached;
    return cache.match(new URL('offline.html', self.registration.scope));
  }
}

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only same-origin GET
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  // HTML navigations
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(networkFirst(req));
    return;
  }

  // Static assets: cache-first
  event.respondWith(cacheFirst(req));
});
