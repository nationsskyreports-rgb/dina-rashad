/* ============================================================
   DINA RASHAD — Smart Service Worker v2.4.0
   ============================================================ */

const VERSION = "2.4.0";
const CACHE_NAME = `dina-interpreter-v${VERSION}`;

const PRECACHE_ASSETS = [
    "/CSS/style.css",
    "/CSS/responsive.css",
    "/CSS/animations.css",
    "/Js/main.js",
    "/Js/booking.js",
    "/Js/pwa.js",
    "/manifest.json",
    "/images/profile.jpg",
    "/images/hero-bg.jpg",
    "/images/icons/icon-192x192.png",
    "/images/icons/icon-512x512.png"
];

self.addEventListener("install", event => {
    console.log(`[SW] Installing v${VERSION}`);
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE_ASSETS))
            .then(() => self.skipWaiting())
            .catch(err => console.error("[SW] Pre-cache failed:", err))
    );
});

self.addEventListener("activate", event => {
    console.log(`[SW] Activating v${VERSION} — cleaning old caches`);
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => {
                        console.log("[SW] Deleting old cache:", key);
                        return caches.delete(key);
                    })
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    const { request } = event;
    const url = new URL(request.url);

    if (request.method !== "GET") return;
    if (!url.protocol.startsWith("http")) return;
    if (url.pathname.startsWith("/cdn-cgi/")) return;

    // HTML: دايماً من النت
    if (request.mode === "navigate" || url.pathname.endsWith(".html")) {
        event.respondWith(networkOnly(request));
        return;
    }

    // CSS / JS: cache-first
    if (
        url.pathname.startsWith("/CSS/") ||
        url.pathname.startsWith("/Js/") ||
        url.pathname.endsWith(".css") ||
        url.pathname.endsWith(".js")
    ) {
        event.respondWith(cacheFirst(request));
        return;
    }

    // Images: network-first عشان التحديثات تظهر فوراً
    if (url.pathname.startsWith("/images/")) {
        event.respondWith(networkFirst(request));
        return;
    }

    // CDN: cache-first
    if (
        url.hostname.includes("googleapis.com") ||
        url.hostname.includes("gstatic.com") ||
        url.hostname.includes("cdnjs.cloudflare.com")
    ) {
        event.respondWith(cacheFirst(request));
        return;
    }

    event.respondWith(networkFirst(request));
});

async function networkOnly(request) {
    try {
        return await fetch(request, { cache: "no-store" });
    } catch {
        const cached = await caches.match("/index.html");
        return cached || new Response("Offline — please check your connection.", {
            status: 503,
            headers: { "Content-Type": "text/plain" }
        });
    }
}

async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        return new Response("Asset unavailable offline.", { status: 503 });
    }
}

async function networkFirst(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === "navigate") {
            return caches.match("/index.html");
        }
        throw new Error("Network and cache both failed");
    }
}

self.addEventListener("message", event => {
    if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
    if (event.data?.type === "CLEAR_CACHE") {
        caches.delete(CACHE_NAME).then(() =>
            event.source.postMessage({ type: "CACHE_CLEARED" })
        );
    }
    if (event.data?.type === "GET_VERSION") {
        event.source.postMessage({ type: "VERSION", version: VERSION });
    }
});

self.addEventListener("push", event => {
    const data = event.data?.json() || {
        title: "Dina Rashad Interpreter",
        body: "You have a new notification!",
        icon: "/images/icons/icon-192x192.png"
    };
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: data.icon || "/images/icons/icon-192x192.png",
            badge: "/images/icons/icon-192x192.png",
            vibrate: [100, 50, 100]
        })
    );
});

self.addEventListener("notificationclick", event => {
    event.notification.close();
    event.waitUntil(clients.openWindow("/"));
});

console.log(`[SW] Service Worker v${VERSION} loaded`);
