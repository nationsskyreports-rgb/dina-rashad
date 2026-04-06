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
    '/css/style.css',
    '/css/responsive.css',
    '/css/animations.css',
    '/js/main.js',
    '/js/booking.js',
    '/js/pwa.js',
    '/manifest.json',
    
    // Images
    '/images/profile.jpg',
    '/images/hero-bg.jpg',
    '/images/portfolio/akkadu.jpg',
    '/images/portfolio/tv-studio.jpg',
    '/images/portfolio/certificate.jpg',
    '/images/portfolio/press-conf.jpg',
    
    // Icons
    '/images/icons/icon-192.png',
    '/images/icons/icon-512.png'
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
                // Force the waiting service worker to become active
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
                        // Delete old caches that don't match current version
                        if (cacheName !== CACHE_NAME) {
                            console.log('[ServiceWorker] Removing old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(function() {
                // Take control of all clients immediately
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
    
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Skip chrome extensions and other non-http(s) requests
    if (!requestUrl.protocol.startsWith('http')) {
        return;
    }
    
    // For navigation requests (HTML pages), use network first
    if (event.request.mode === 'navigate') {
        event.respondWith(networkFirst(event.request));
        return;
    }
    
    // For CSS, JS, and images - use stale while revalidate
    if (
        requestUrl.pathname.endsWith('.css') ||
        requestUrl.pathname.endsWith('.js') ||
        requestUrl.pathname.startsWith('/images/') ||
        requestUrl.pathname.startsWith('/css/') ||
        requestUrl.pathname.startsWith('/js/')
    ) {
        event.respondWith(staleWhileRevalidate(event.request));
        return;
    }
    
    // For fonts and external resources - cache first
    if (
        requestUrl.hostname.includes('googleapis.com') ||
        requestUrl.hostname.includes('gstatic.com') ||
        requestUrl.hostname.includes('cdnjs.cloudflare.com')
    ) {
        event.respondWith(cacheFirst(event.request));
        return;
    }
    
    // Default: network first
    event.respondWith(networkFirst(event.request));
});

/* ===================================
   CACHING STRATEGIES
   =================================== */

/**
 * Network First Strategy
 * Try network first, fallback to cache
 * Good for: HTML pages, API calls
 */
async function networkFirst(request) {
    try {
        // Try network first
        const networkResponse = await fetch(request);
        
        // If successful, cache the response
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        // Network failed, try cache
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // If no cache match for HTML requests, return offline page
        if (request.mode === 'navigate') {
            return caches.match('/index.html');
        }
        
        throw error;
    }
}

/**
 * Stale While Revalidate Strategy
 * Return cached version immediately, update cache in background
 * Good for: Static assets like CSS, JS, images
 */
async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    // Fetch in background to update cache
    const fetchPromise = fetch(request)
        .then(function(networkResponse) {
            if (networkResponse.ok) {
                cache.put(request, networkResponse.clone());
            }
            return networkResponse;
        })
        .catch(function(error) {
            // If network fails and no cache, return a basic response
            if (!cachedResponse && request.destination === 'image') {
                return new Response('', {
                    status: 200,
                    headers: { 'Content-Type': 'image/svg+xml' }
                });
            }
        });
    
    // Return cached version immediately, or wait for network
    return cachedResponse || fetchPromise;
}

/**
 * Cache First Strategy
 * Try cache first, fallback to network
 * Good for: Fonts, static CDN resources
 */
async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        // Return a fallback or throw error
        throw error;
    }
}

/* ===================================
   MESSAGE HANDLING
   Handle messages from the main app
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
   BACKGROUND SYNC (Future Feature)
   Sync data when back online
   =================================== */
self.addEventListener('sync', function(event) {
    console.log('[ServiceWorker] Background sync:', event.tag);
    
    if (event.tag === 'sync-bookings') {
        event.waitUntil(syncBookings());
    }
});

// Placeholder for syncing bookings
async function syncBookings() {
    // This would sync pending bookings when online
    console.log('[ServiceWorker] Syncing bookings...');
}

/* ===================================
   PUSH NOTIFICATIONS (Future Feature)
   Handle push notifications
   =================================== */
self.addEventListener('push', function(event) {
    console.log('[ServiceWorker] Push received');
    
    let data = {
        title: 'Dina Rashad Interpreter',
        body: 'You have a new notification!',
        icon: '/images/icons/icon-192.png',
        badge: '/images/icons/icon-72x72.png'
    };
    
    if (event.data) {
        data = event.data.json();
    }
    
    const options = {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            { action: 'open', title: 'Open App' },
            { action: 'close', title: 'Close' }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
    console.log('[ServiceWorker] Notification click:', event.action);
    
    event.notification.close();
    
    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

console.log('[ServiceWorker] Service Worker loaded');
