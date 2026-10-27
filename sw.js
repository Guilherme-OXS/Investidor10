// InvestLucro - Service Worker de Alta Performance PWA (Parte 5.5 - 12 Categorias, Catálogo Amplo e Abas Interativas)
const CACHE_NAME = 'investlucro-v5.5.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/login',
  '/login.html',
  '/radar',
  '/radar.html',
  '/comparador',
  '/comparador.html',
  '/carteira',
  '/carteira.html',
  '/simulador',
  '/simulador.html',
  '/noticias',
  '/noticias.html',
  '/manifest.json',
  '/css/style.css',
  '/js/data.js',
  '/js/cdiEngine.js',
  '/js/auth.js',
  '/js/valuation.js',
  '/js/charts.js',
  '/js/liveData.js',
  '/js/app.js',
  '/icons/favicon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptação de requisições: Stale-While-Revalidate para máxima velocidade
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Ignora requisições dinâmicas à API Serverless da Vercel
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
