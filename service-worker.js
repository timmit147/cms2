const cacheName = 'my-cache-v2';
const assetsToCache = [
    '/',
    '/index.html',
    '/style.css',
    // Add more URLs to cache here
];

const imagesFolder = '/images/';

// Fetch all images from the "images" folder dynamically
async function fetchAndCacheImages() {
    const imageFilesResponse = await fetch(imagesFolder);
    const imageFilesText = await imageFilesResponse.text();

    // Parse the HTML content to find image URLs
    const imageUrls = Array.from(imageFilesText.matchAll(/src=["'](.*?)["']/g), match => match[1]);

    // Cache the image URLs
    assetsToCache.push(...imageUrls);
}

// Call the function to fetch and cache images
fetchAndCacheImages();

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheName).then(cache => {
            return cache.addAll(assetsToCache);
        })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        // Clean up old caches here (if needed)
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => {
                    // Check if the cache name is not the current cache
                    return name !== cacheName;
                }).map(name => {
                    // Delete the outdated cache
                    return caches.delete(name);
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            // Serve cached resource if available
            if (response) {
                return response;
            }

            // Fetch from the network and cache new resources
            return fetch(event.request).then(networkResponse => {
                // Check if the response is valid
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }

                // Clone the response for caching
                const clonedResponse = networkResponse.clone();

                caches.open(cacheName).then(cache => {
                    cache.put(event.request, clonedResponse);
                });

                return networkResponse;
            }).catch(() => {
                // Handle fetch errors gracefully
                return new Response('Offline fallback content', { headers: { 'Content-Type': 'text/html' } });
            });
        })
    );
});
