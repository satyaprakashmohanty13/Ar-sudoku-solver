/**
 * Workbox-powered Service Worker (optimized)
 * v4.3.1 compatible
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

// ⚠️ Keep your generated precache-manifest import:
importScripts("/precache-manifest.3f95e6636e8443ac1bddce2fbb4e05d2.js");

// ---- Lifecycle helpers ----
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Take control ASAP after activation
workbox.core.clientsClaim();

// ---- Precache (add your own extra files here) ----
// Your build adds entries to self.__precacheManifest; we can extend it safely:
self.__precacheManifest = (self.__precacheManifest || []).concat([
  // Offline fallback + icons (edit paths if different)
  { url: '/offline.html', revision: '1' },
  { url: '/icons/icon-192.png', revision: null },
  { url: '/icons/icon-512.png', revision: null }
]);

workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

// App-shell style navigation to index.html (single-page app)
workbox.routing.registerNavigationRoute(
  workbox.precaching.getCacheKeyForURL('/index.html'),
  {
    // ignore asset files and framework routes
    blacklist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
  }
);

// ---- Runtime caching strategies ----

// 1) CSS & JS: fast first, then refresh in background
workbox.routing.registerRoute(
  /\.(?:js|css)$/,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'static-resources',
  })
);

// 2) Images: prefer cache, fall back to network, expire old ones
workbox.routing.registerRoute(
  /\.(?:png|jpg|jpeg|gif|svg|webp|ico)$/,
  new workbox.strategies.CacheFirst({
    cacheName: 'images',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 80,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// 3) Google Fonts (if you use them)
workbox.routing.registerRoute(
  /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'google-fonts',
  })
);

// 4) API calls (optional): network-first with a short fallback cache
// Change `/api/` to match your API base if you have one
workbox.routing.registerRoute(
  /\/api\/.*\/*.*/i,
  new workbox.strategies.NetworkFirst({
    cacheName: 'api',
    networkTimeoutSeconds: 5, // fallback quickly if offline/slow
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60 // 5 minutes
      })
    ]
  })
);

// ---- Offline fallback for navigations ----
// If navigation fails (offline and not in cache), show /offline.html
const handler = async (args) => {
  try {
    return await workbox.strategies.NetworkFirst({
      cacheName: 'html-pages',
    }).handle(args);
  } catch (e) {
    return caches.match('/offline.html', { ignoreSearch: true });
  }
};
workbox.routing.registerRoute(({ request }) => request.mode === 'navigate', handler);
