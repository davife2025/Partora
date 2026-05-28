// Partora Service Worker — caches static assets and API responses

const CACHE_NAME     = "partora-v1";
const AUDIO_CACHE    = "partora-audio-v1";
const STATIC_ASSETS  = [
  "/",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// ── Install ──────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// ── Activate ─────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== AUDIO_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch ────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, cross-origin API calls, Supabase, HuggingFace
  if (request.method !== "GET") return;
  if (url.pathname.startsWith("/api/")) return;
  if (url.hostname.includes("supabase.co")) return;
  if (url.hostname.includes("huggingface.co")) return;
  if (url.hostname.includes("api.audd.io")) return;

  // Audio files — cache then serve
  if (url.pathname.endsWith(".mp3") || url.pathname.endsWith(".wav")) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      })
    );
    return;
  }

  // Static assets — cache first, network fallback
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.json"
  ) {
    event.respondWith(
      caches.match(request).then((cached) => cached ?? fetch(request))
    );
    return;
  }

  // Pages — network first, cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
