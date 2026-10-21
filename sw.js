// Bíblia Sagrada — funciona offline. Versão aa4cca210c
const CACHE = 'biblia-aa4cca210c';
const BASICO = ['./', 'index.html', 'manifest.webmanifest', 'dados/blivre.json', 'dados/bpm.json', 'icons/icon-192.png', 'icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASICO)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  if (/fonts\.(googleapis|gstatic)\.com/.test(u.host)) { // letras: guarda na primeira vez
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => { const c = res.clone(); caches.open(CACHE).then(k => k.put(e.request, c)); return res; })));
    return;
  }
  if (u.origin !== location.origin) return;
  if (u.pathname.includes('/dados/')) { // texto bíblico: do cache (só muda quando a versão muda)
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
    return;
  }
  // app: tenta a versão nova, sem internet usa a guardada
  e.respondWith(fetch(e.request, {cache: 'no-cache'}).then(res => { const c = res.clone(); caches.open(CACHE).then(k => k.put(e.request, c)); return res; }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
});
