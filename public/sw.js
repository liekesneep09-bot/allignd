const CACHE_NAME = 'allignd-v6'; // Bumped version to bust stale caches
const STATIC_ASSETS = [
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png'
];
// NOTE: /index.html is intentionally NOT cached — always fetched from network

// Install: Cache static assets only (no HTML)
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Force activate immediately
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(STATIC_ASSETS))
    );
});

// Activate: Clean ALL old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        }).then(() => self.clients.claim()) // Claim clients immediately
    );
});

// Fetch: Strategy
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // 1. Skip non-GET requests (POST/PUT/DELETE always go to network)
    if (request.method !== 'GET') return;

    // 2. IGNORE external requests (Supabase, CDNs, etc.)
    if (url.origin !== self.location.origin) return;

    // 3. API calls: Network only (never cache)
    if (url.pathname.startsWith('/api')) {
        event.respondWith(
            fetch(request).catch(() => {
                return new Response(
                    JSON.stringify({ error: 'Je bent offline' }),
                    { status: 503, headers: { 'Content-Type': 'application/json' } }
                );
            })
        );
        return;
    }

    // 4. Navigation requests (HTML pages): NETWORK FIRST
    //    This ensures we always get the latest index.html with correct JS hashes
    if (request.mode === 'navigate' || request.destination === 'document') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Cache the fresh HTML for offline fallback
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    return response;
                })
                .catch(() => {
                    // Offline: serve cached HTML as fallback
                    return caches.match('/index.html') || caches.match(request);
                })
        );
        return;
    }

    // 5. Hashed assets (JS/CSS bundles): Cache first (filenames contain hash, safe to cache)
    if (url.pathname.startsWith('/assets/')) {
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) return cached;
                return fetch(request).then((response) => {
                    if (response && response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    }
                    return response;
                });
            })
        );
        return;
    }

    // 6. Other same-origin static files (icons, manifest, etc.): Network first
    event.respondWith(
        fetch(request)
            .then((response) => {
                if (response && response.status === 200 && response.type === 'basic') {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                }
                return response;
            })
            .catch(() => caches.match(request))
    );
});
