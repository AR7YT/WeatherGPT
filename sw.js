/**
 * WeatherGPT Service Worker — Offline Caching & Progressive Web App Support
 * Cache Version: weathergpt-v1.0.0
 */

const CACHE_NAME = 'weathergpt-v1.0.0';

// Core shell assets for instant loading & offline UI
const PRECACHE_ASSETS = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/icon-maskable.png',
    './icons/icon.svg',
    './icons/favicon.png'
];

// Install Event — Pre-cache UI shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_ASSETS);
        }).then(() => self.skipWaiting())
    );
});

// Activate Event — Clean up stale versions
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Event — Smart caching strategy
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Live API endpoints (Open-Meteo, Google Gemini, OpenAI, Nominatim) -> Network-First
    if (
        url.hostname.includes('open-meteo.com') ||
        url.hostname.includes('googleapis.com') ||
        url.hostname.includes('openai.com') ||
        url.hostname.includes('rainviewer.com')
    ) {
        event.respondWith(
            fetch(event.request).catch(() => {
                // If offline and request fails, try cache if available
                return caches.match(event.request);
            })
        );
        return;
    }

    // Static Assets & CDN libraries -> Stale-While-Revalidate / Cache-First
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                // Fetch fresh copy in background to keep cache up to date
                fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, networkResponse);
                        });
                    }
                }).catch(() => {/* Ignore offline background fetch fail */});

                return cachedResponse;
            }

            // Not in cache -> fetch from network and store copy
            return fetch(event.request).then((networkResponse) => {
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && networkResponse.type !== 'cors') {
                    return networkResponse;
                }

                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return networkResponse;
            }).catch(() => {
                // Offline fallback for navigation requests
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
