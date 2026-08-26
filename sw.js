const CACHE_NAME = 'codex-xesh-v4'; // Passage en v4 pour forcer la mise à jour
const FILES_TO_CACHE = [
  './',
  './index.html',
  './data.js',
  './manifest.json',
  './Xesh.webp'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      // 1. Si la ressource est déjà dans le cache, on la retourne immédiatement
      if (response) {
        return response;
      }
      
      // 2. Sinon, on tente de la récupérer sur le réseau
      return fetch(e.request).then((networkResponse) => {
        // On vérifie que la réponse du réseau est valide
        if(!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
          return networkResponse;
        }

        // On clone la réponse pour pouvoir la mettre en cache tout en la retournant au navigateur
        const responseToCache = networkResponse.clone();

        // On ajoute la nouvelle ressource (les icônes .webp) au cache dynamiquement
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
});
