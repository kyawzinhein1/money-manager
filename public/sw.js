const CACHE_NAME = 'money-manager-v9';

// Core shell assets to pre-cache immediately
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/version.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/icon-maskable.png',
  '/icon.svg',
  '/screenshot-narrow.png',
  '/screenshot-wide.png'
];

// Handle Service Worker commands (SKIP_WAITING, CLEAR_CACHE)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    });
  }
});

// Install event - Pre-cache core shell assets & auto-discover bundled assets from index.html
// Note: DO NOT call skipWaiting() here so updates only take effect when the user explicitly accepts.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // 1. Add core static assets
      await cache.addAll(CORE_ASSETS).catch((err) => {
        console.warn('SW core pre-cache warning:', err);
      });

      // 2. Fetch /index.html and pre-cache any referenced JS/CSS assets
      try {
        const indexResponse = await fetch('/index.html');
        if (indexResponse && indexResponse.ok) {
          const htmlText = await indexResponse.text();
          // Extract script src and link href URLs
          const assetMatches = htmlText.match(/(?:src|href)=["']([^"']+\.(?:js|css|woff2|png|svg|json))["']/gi) || [];
          const relativeAssets = assetMatches
            .map((m) => m.replace(/^(?:src|href)=["']|["']$/gi, ''))
            .filter((url) => !url.startsWith('http') && !url.startsWith('//'));

          if (relativeAssets.length > 0) {
            await cache.addAll([...new Set(relativeAssets)]).catch((e) => {
              console.warn('SW auto-discovered asset pre-cache warning:', e);
            });
          }
        }
      } catch (err) {
        console.warn('Failed to parse index.html during SW installation:', err);
      }
    })
  );
});

// Activate event - Delete outdated cache buckets and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('/');
    })
  );
});

// Fetch event listener - Pure Cache-First for active version (No silent background replacement)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isGoogleFont = url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com');

  // Ignore third-party non-font requests
  if (!isSameOrigin && !isGoogleFont) return;

  // 1. Version checking endpoint -> Always Network-First (no-store), fallback to cached version
  if (isSameOrigin && url.pathname === '/version.json') {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then((networkResponse) => {
          return networkResponse;
        })
        .catch(() => {
          return caches.match('/version.json', { ignoreSearch: true }).then((res) => {
            if (res) return res;
            return new Response(JSON.stringify({ version: 'v2.1.9', buildHash: 'offline' }), {
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }

  // 2. Navigation / HTML Document requests (e.g. /, /index.html, /index.html?pwa=1)
  const isNavigation =
    event.request.mode === 'navigate' ||
    (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) ||
    (isSameOrigin && (url.pathname === '/' || url.pathname === '/index.html'));

  if (isNavigation) {
    event.respondWith(
      caches.match(event.request, { ignoreSearch: true }).then((cachedIndex) => {
        // If cached index.html exists, return it directly for active version
        if (cachedIndex) {
          return cachedIndex;
        }

        // Cache miss for index -> Network fetch and store in cache
        return fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              const cacheCopy = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put('/index.html', cacheCopy.clone());
                cache.put('/', cacheCopy.clone());
                cache.put(event.request, cacheCopy);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Absolute fallback for navigation -> root or index.html
            return caches.match('/', { ignoreSearch: true }).then((rootRes) => {
              if (rootRes) return rootRes;
              return caches.match('/index.html', { ignoreSearch: true });
            });
          });
      })
    );
    return;
  }

  // 3. Static Assets (JS, CSS, PNG, SVG, Fonts, JSON) -> Pure Cache-First for active version
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedAsset) => {
      if (cachedAsset) {
        return cachedAsset;
      }

      // Fetch from network if not in cache, then cache it
      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const cacheCopy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cacheCopy));
          }
          return networkResponse;
        })
        .catch(() => {
          // If asset is completely missing and offline, fallback to cached index.html or empty asset
          return caches.match('/index.html', { ignoreSearch: true }).then((fallback) => {
            if (fallback && url.pathname.endsWith('.html')) return fallback;
            return new Response('', { status: 404, statusText: 'Offline Asset Not Cached' });
          });
        });
    })
  );
});
