// v2: the app page and data load fresh from the network when online,
// so new versions show up right away. The cache is only used offline.
const C = 'wellness-v2';
const CORE = ['./', 'index.html', 'bodymap.json', 'manifest.webmanifest', 'icon-180.png', 'icon-512.png'];

self.addEventListener('install', e => e.waitUntil(caches.open(C).then(c => c.addAll(CORE)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())));

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  const save = res => { if (res.ok) { const cp = res.clone(); caches.open(C).then(c => c.put(e.request, cp)); } return res; };
  // Exercise pictures never change: serve from cache first.
  if (url.pathname.includes('/frames/')) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(save)));
    return;
  }
  // Everything else: network first, cache as offline fallback.
  e.respondWith(fetch(e.request, {cache: 'no-cache'}).then(save).catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
});
