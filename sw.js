/* ===================================
   DINA RASHAD - INTERPRETER PWA
   Service Worker
   Handles caching and offline functionality
   =================================== */

// Cache name with version for easy updates
const CACHE_NAME = 'dina-interpreter-v1.0.0';

// Assets to pre-cache during installation
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/about.html',
    '/portfolio.html',
    '/booking.html',
    '/contact.html',
    '/CSS/style.css',
    '/CSS/responsive.css',
    '/CSS/animations.css',
    '/Js/main.js',
    '/Js/booking.js',
    '/Js/pwa.js',
    '/manifest.json',
    
    // Images
    '/images/profile.jpg',
    '/images/hero-bg.jpg',
    
    // Icons
    '/images/icons/icon-192x192.png',
    '/images/icons/icon-512x512.png'
];

// External resources to cache (CDN)
const EXTERNAL_ASSETS = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

/* ===================================
   INSTALL EVENT
   Pre-cache essential assets
   =================================== */
self.addEventListener('install', function(event) {
    console.log('[ServiceWorker] Install');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('[ServiceWorker] Pre-caching assets');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(function() {
                return self.skipWaiting();
            })
            .catch(function(error) {
                console.error('[ServiceWorker] Pre-cache failed:', error);
            })
    );
});

/* ===================================
   ACTIVATE EVENT
   Clean up old caches
   =================================== */
self.addEventListener('activate', function(event) {
    console.log('[ServiceWorker] Activate');
    
    event.waitUntil(
        caches.keys()
            .then(function(cacheNames) {
                return Promise.all(
                    cacheNames.map(function(cacheName) {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[ServiceWorker] Removing old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(function() {
                return self.clients.claim();
            })
    );
});

/* ===================================
   FETCH EVENT
   Network-first strategy with cache fallback
   =================================== */
self.addEventListener('fetch', function(event) {
    const requestUrl = new URL(event.request.url);
    
    if (event.request.method !== 'GET') return;
    if (!requestUrl.protocol.startsWith('http')) return;
    
    if (event.request.mode === 'navigate') {
        event.respondWith(networkFirst(event.request));
        return;
    }
    
    if (
        requestUrl.pathname.endsWith('.css') ||
        requestUrl.pathname.endsWith('.js') ||
        requestUrl.pathname.startsWith('/images/') ||
        requestUrl.pathname.startsWith('/CSS/') ||
        requestUrl.pathname.startsWith('/Js/')
    ) {
        event.respondWith(staleWhileRevalidate(event.request));
        return;
    }
    
    if (
        requestUrl.hostname.includes('googleapis.com') ||
        requestUrl.hostname.includes('gstatic.com') ||
        requestUrl.hostname.includes('cdnjs.cloudflare.com')
    ) {
        event.respondWith(cacheFirst(event.request));
        return;
    }
    
    event.respondWith(networkFirst(event.request));
});

/* ===================================
   CACHING STRATEGIES
   =================================== */

async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) return cachedResponse;
        if (request.mode === 'navigate') return caches.match('/index.html');
        throw error;
    }
}

async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    const fetchPromise = fetch(request)
        .then(function(networkResponse) {
            if (networkResponse.ok) {
                cache.put(request, networkResponse.clone());
            }
            return networkResponse;
        })
        .catch(function() {
            if (!cachedResponse && request.destination === 'image') {
                return new Response('', {
                    status: 200,
                    headers: { 'Content-Type': 'image/svg+xml' }
                });
            }
        });
    
    return cachedResponse || fetchPromise;
}

async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) return cachedResponse;
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        throw error;
    }
}

/* ===================================
   MESSAGE HANDLING
   =================================== */
self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.delete(CACHE_NAME).then(function() {
            event.source.postMessage({ type: 'CACHE_CLEARED' });
        });
    }
});

/* ===================================
   BACKGROUND SYNC
   =================================== */
self.addEventListener('sync', function(event) {
    if (event.tag === 'sync-bookings') {
        event.waitUntil(syncBookings());
    }
});

async function syncBookings() {
    console.log('[ServiceWorker] Syncing bookings...');
}

/* ===================================
   PUSH NOTIFICATIONS
   =================================== */
self.addEventListener('push', function(event) {
    let data = {
        title: 'Dina Rashad Interpreter',
        body: 'You have a new notification!',
        icon: '/images/icons/icon-192x192.png',
        badge: '/images/icons/icon-192x192.png'
    };
    
    if (event.data) data = event.data.json();
    
    const options = {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        vibrate: [100, 50, 100],
        data: { dateOfArrival: Date.now(), primaryKey: 1 },
        actions: [
            { action: 'open', title: 'Open App' },
            { action: 'close', title: 'Close' }
        ]
    };
    
    event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    if (event.action === 'open' || !event.action) {
        event.waitUntil(clients.openWindow('/'));
    }
});

console.log('[ServiceWorker] Service Worker loaded');
