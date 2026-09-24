const CACHE_NAME = 'easymedpro-v1.0.2';
const STATIC_CACHE_NAME = 'easymedpro-static-v1.0.2';
const DYNAMIC_CACHE_NAME = 'easymedpro-dynamic-v1.0.2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/medical-icon.svg'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch((error) => console.error('Service Worker: Cache installation failed', error))
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) =>
              cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME
            )
            .map((cacheName) => caches.delete(cacheName))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Never cache authentication or healthcare API responses. These may contain
  // session state or PHI and must always be fetched from the network.
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request));
    return;
  }

  // HTML, manifests, JS and CSS must prefer the network so a new deployment
  // cannot leave the browser using an old index.html with missing hashed assets.
  if (
    request.destination === 'document' ||
    request.destination === 'script' ||
    request.destination === 'style' ||
    url.pathname === '/manifest.json'
  ) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Images and other static media can use cache-first with a network fallback.
  if (request.destination === 'image' || request.destination === 'font') {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});

async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache First strategy failed:', error);
    return new Response('Offline - Content not available', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn('Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    if (request.destination === 'document') {
      const fallback = await caches.match('/');
      if (fallback) return fallback;
    }

    return new Response('Offline - Content not available', { status: 503 });
  }
});

self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'EasyMedPro Health Reminder',
    icon: '/icon-192.png',
    badge: '/badge-icon.png',
    vibrate: [100, 50, 100],
    tag: 'health-reminder',
    requireInteraction: true,
    actions: [
      { action: 'view', title: 'View Details' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    data: { url: '/', timestamp: Date.now() }
  };

  event.waitUntil(
    self.registration.showNotification('EasyMedPro Health Alert', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(clients.openWindow(event.notification.data.url || '/'));
  } else if (!event.action || event.action !== 'dismiss') {
    event.waitUntil(clients.openWindow('/'));
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('Service Worker: Loaded successfully');
