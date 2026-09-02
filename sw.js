const CACHE_NAME = "quinc-diallo-cache-v1";
const CORE_ASSETS = [
  "./quincaillerie-diallo.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Stratégie "network-first" : essaie le réseau (données à jour),
// retombe sur le cache si hors-ligne.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // Ne jamais mettre en cache les appels Firebase / API externes
  if (event.request.url.includes("firestore") || event.request.url.includes("googleapis")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const respClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, respClone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
