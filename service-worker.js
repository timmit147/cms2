const cacheName = 'my-cache-v2'; // Change the version number as needed

const assetsToCache = [
    '/',
    '/index.html',
    '/style.css',
    // Add more URLs to cache here
];

const imagesFolder = '/images/';

// Function to clear old caches
async function clearOldCaches() {
    const cacheNames = await caches.keys();
    return Promise.all(
        cacheNames
            .filter(name => name !== cacheName)
            .map(name => caches.delete(name))
    );
}

// Fetch all images from the "images" folder dynamically
async function fetchAndCacheImages() {
    try {
        // Check if the server is available before fetching
        const serverResponse = await fetch(imagesFolder, { method: 'HEAD' });
        if (serverResponse.status !== 200) {
            throw new Error('Server not available');
        }

        const imageFilesResponse = await fetch(imagesFolder);
        const imageFilesText = await imageFilesResponse.text();

        // Parse the HTML content to find image URLs
        const imageUrls = Array.from(
            imageFilesText.matchAll(/src=["'](.*?)["']/g),
            match => match[1]
        );

        // Cache the image URLs
        assetsToCache.push(...imageUrls);
    } catch (error) {
        console.error('Error fetching images:', error);
    }
}

// Call the function to clear old caches during installation
self.addEventListener('install', event => {
    event.waitUntil(
        Promise.all([clearOldCaches(), fetchAndCacheImages()]).then(() => {
            return caches.open(cacheName).then(cache => {
                return cache.addAll(assetsToCache);
            });
        })
    );
});

// Activate event to clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(clearOldCaches());
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            // Always fetch from the network in the background to update the cache
            const fetchPromise = fetch(event.request)
                .then(networkResponse => {
                    // Check if the response is valid and cache it
                    if (
                        networkResponse &&
                        networkResponse.status === 200 &&
                        networkResponse.type === 'basic'
                    ) {
                        const clonedResponse = networkResponse.clone();
                        caches.open(cacheName).then(cache => {
                            cache.put(event.request, clonedResponse);
                        });
                    }
                    return networkResponse;
                })
                .catch(() => {
                    // Handle fetch errors gracefully
                    return new Response('Offline fallback content', {
                        headers: { 'Content-Type': 'text/html' },
                    });
                });

            // Serve cached resource if available, but don't wait for it
            const cachedResponse = response || fetchPromise;
            return cachedResponse;
        })
    );
});
