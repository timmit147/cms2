// service-worker.js

// Define a cache name and list of assets to cache during installation
const cacheName = 'my-cache-v1';
const assetsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    // Add more URLs to cache here
];

// Event listener for the installation phase
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheName).then(cache => {
            return cache.addAll(assetsToCache);
        })
    );
});

// Event listener for the activation phase
self.addEventListener('activate', event => {
    // Perform cache cleanup or other activation tasks here
});

// Event listener for fetch events
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
