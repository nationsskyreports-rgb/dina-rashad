/* ============================================================
   DINA RASHAD — Smart Service Worker
   
   الاستراتيجية:
   - HTML  → دايماً من النت (network-first, مش بيتكاش)
   - CSS/JS → من الكاش أول (cache-first) — بنكسره بـ ?v=
   - Images → من الكاش أول مع تحديث في الخلفية
   - CDN   → من الكاش أول
   ============================================================ */

// ⬆️ غيّر الرقم ده بس لما تحدّث CSS أو JS
const VERSION = "2.1.0";
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

// ============================================================
//  INSTALL — cache الـ assets بس (مش الـ HTML)
// ============================================================
self.addEventListener("install", event => {
    console.log(`[SW] Installing v${VERSION}`);
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE_ASSETS))
            .then(() => self.skipWaiting())
            .catch(err => console.error("[SW] Pre-cache failed:", err))
    );
});

// ============================================================
//  ACTIVATE — احذف الكاش القديم أوتوماتيك
// ============================================================
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

// ============================================================
//  FETCH — القواعد الذكية
// ============================================================
self.addEventListener("fetch", event => {
    const { request } = event;
    const url = new URL(request.url);

    // تجاهل غير GET
    if (request.method !== "GET") return;
    if (!url.protocol.startsWith("http")) return;

    // ── HTML: دايماً من النت، مش بيتكاش في SW ──────────────
    if (request.mode === "navigate" || url.pathname.endsWith(".html")) {
        event.respondWith(networkOnly(request));
        return;
    }

    // ── CSS / JS: من الكاش (cache-first) ────────────────────
    if (
        url.pathname.startsWith("/CSS/") ||
        url.pathname.startsWith("/Js/") ||
        url.pathname.endsWith(".css") ||
        url.pathname.endsWith(".js")
    ) {
        event.respondWith(cacheFirst(request));
        return;
    }

    // ── Images: Stale-While-Revalidate ───────────────────────
    if (url.pathname.startsWith("/images/")) {
        event.respondWith(staleWhileRevalidate(request));
        return;
    }

    // ── CDN (fonts, icons): Cache-First ─────────────────────
    if (
        url.hostname.includes("googleapis.com") ||
        url.hostname.includes("gstatic.com") ||
        url.hostname.includes("cdnjs.cloudflare.com")
    ) {
        event.respondWith(cacheFirst(request));
        return;
    }

    // ── الباقي: Network-First ────────────────────────────────
    event.respondWith(networkFirst(request));
});

// ============================================================
//  STRATEGIES
// ============================================================

/** HTML — من النت دايماً، لو الشبكة وقعت يرجع الـ cache */
async function networkOnly(request) {
    try {
        const response = await fetch(request, { cache: "no-store" });
        return response;
    } catch {
        // Offline fallback — ارجع index من الكاش لو موجود
        const cached = await caches.match("/index.html");
        return cached || new Response("Offline — please check your connection.", {
            status: 503,
            headers: { "Content-Type": "text/plain" }
        });
    }
}

/** CSS/JS — من الكاش أول، لو مش موجود اجيبه من النت وحفظه */
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

/** Images — ارجع من الكاش فوراً وحدّث في الخلفية */
async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    const fetchPromise = fetch(request).then(response => {
        if (response.ok) cache.put(request, response.clone());
        return response;
    }).catch(() => null);

    return cached || await fetchPromise || new Response("", { status: 503 });
}

/** Network-First مع Cache Fallback */
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

// ============================================================
//  MESSAGES
// ============================================================
self.addEventListener("message", event => {
    if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
    if (event.data?.type === "CLEAR_CACHE") {
        caches.delete(CACHE_NAME).then(() =>
            event.source.postMessage({ type: "CACHE_CLEARED" })
        );
    }
    // طلب الـ version الحالي
    if (event.data?.type === "GET_VERSION") {
        event.source.postMessage({ type: "VERSION", version: VERSION });
    }
});

// ============================================================
//  PUSH NOTIFICATIONS
// ============================================================
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
