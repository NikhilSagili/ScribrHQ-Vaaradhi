// Network-first cache so the demo still opens if the venue Wi-Fi drops.
const CACHE = 'vaaradhi-demo-v12';
const FILES = ['./', './index.html', './manifest.webmanifest', './css/app.css', './js/app.js', './data/config.js', './data/catalogue.js', './data/plans.js', './data/product-images.js', './slides.html',
  ...['c-home','c-shop','c-baskets','c-subscribe','c-manage','c-meals','c-meal-prefs','m-overview','m-orders','m-tomorrow','m-plans','m-interest'].map(n => `./assets/slides/${n}.png`), './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  // Product photos are listed in data/product-images.js, so read the list from there.
  e.waitUntil(caches.open(CACHE).then(async c => {
    await c.addAll(FILES);
    const txt = await (await fetch('./data/product-images.js')).text();
    await c.addAll([...new Set([...txt.matchAll(/"src":\s*"([^"]+)"/g)].map(m => './' + m[1]))]);
  }));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res; })
      .catch(() => caches.match(e.request))
  );
});
