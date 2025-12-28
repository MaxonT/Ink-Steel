const CACHE_NAME = 'ink-and-steel-v1';
// Use relative paths that work in different deployment environments
const getBasePath = () => {
  // Try to detect base path from scope
  const scope = self.registration?.scope || self.location.pathname.replace(/\/[^/]*$/, '/');
  return scope.endsWith('/') ? scope.slice(0, -1) : '';
};

const BASE_PATH = getBasePath();

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/styles/tokens.css',
  '/assets/styles/states.css',
  '/assets/styles/main.css',
  '/assets/scripts/main.js',
  '/public/manifest.json',
  '/about.html',
  '/blog.html',
  '/brands.html',
  '/care.html',
  '/compare.html',
  '/contact.html',
  '/favorites.html',
  '/history.html',
  '/inks.html',
  '/pen-detail.html',
  '/ink-detail.html',
  '/stats.html',
  '/404.html',
  '/offline.html',
  '/assets/scripts/components/navbar.js',
  '/assets/scripts/components/footer.js',
  '/assets/scripts/components/pen-detail.js',
  '/assets/scripts/components/pen-gallery.js',
  '/assets/scripts/components/purchase-links.js',
  '/assets/scripts/components/ink-swatch.js',
  '/assets/scripts/components/ink-detail.js',
  '/assets/scripts/components/favorite-button.js',
  '/assets/scripts/components/share-button.js',
  '/assets/scripts/components/pen-comparison.js',
  '/assets/scripts/components/size-visualization.js',
  '/assets/scripts/components/loading-spinner.js',
  '/assets/scripts/utils/page-utils.js',
  '/assets/scripts/utils/seo-utils.js',
  '/assets/scripts/utils/search-utils.js',
  '/assets/scripts/utils/browsing-history.js',
  '/assets/scripts/utils/security.js',
  '/assets/scripts/utils/error-handler.js',
  '/assets/scripts/utils/validators.js',
  '/data/pens.json',
  '/data/inks.json'
].map(path => BASE_PATH + path);

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        // Cache assets one by one to handle failures gracefully
        return Promise.allSettled(
          STATIC_ASSETS.map(url => 
            cache.add(url).catch(err => {
              console.warn(`Failed to cache ${url}:`, err);
              return null;
            })
          )
        );
      })
      .catch((err) => {
        console.error('Error caching static assets:', err);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the fetched response
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // If offline and page request, return offline page
            if (event.request.destination === 'document') {
              return caches.match(BASE_PATH + '/offline.html') || 
                     caches.match(BASE_PATH + '/404.html') ||
                     new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
            }
          });
      })
  );
});
