// sw.js - Service Worker AverageInt v1.0.0
const CACHE_NAME = "averageint-v1-0-0";

// Arquivos para cache (todos os seus arquivos atuais)
const STATIC_FILES = [
  "/",
  "/index.html",
  "/global.css",
  "/index-style.css",
  "/mobile-layout.css",
  "/app.js",
  "/dicas.js",
  "/public/manifest.json",
  "/public/favicon.svg",
  "/public/favicon-192.png",
  "/public/favicon-32.png",
  "/public/favicon-16.png",
  "/public/favicon-48.png",
  "/public/apple-touch-icon-180.png",
  "/public/favicon.ico",
];

// Instalar Service Worker
self.addEventListener("install", (event) => {
  console.log("[SW] Instalando Service Worker v1.0.0");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Cacheando arquivos...");
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log("[SW] Todos os arquivos foram cacheados!");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("[SW] Erro ao cachear:", error);
      })
  );
});

// Ativar Service Worker
self.addEventListener("activate", (event) => {
  console.log("[SW] Ativando Service Worker v1.0.0");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("[SW] Removendo cache antigo:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("[SW] Service Worker ativado!");
        return self.clients.claim();
      })
  );
});

// Interceptar requisições (CACHE FIRST)
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log("[SW] Servindo do cache:", event.request.url);
        return cachedResponse;
      }

      console.log("[SW] Buscando na rede:", event.request.url);
      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback para página principal se offline
          if (event.request.headers.get("accept").includes("text/html")) {
            return caches.match("/index.html");
          }
        });
    })
  );
});

console.log("[SW] Service Worker AverageInt v1.0.0 carregado");
