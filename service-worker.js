// Define a cache name
const cacheName = 'my-cache';

// List of files to cache
const filesToCache = [
  '/',
  '/style.css', 
  '/main.js',
  '/blocks',  
  '/blocks/imageBlock/body.html', 
];

// Install event: Cache files when the Service Worker is installed
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => cache.addAll(filesToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate event: Clear old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== cacheName) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: Serve files from cache, if available
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
