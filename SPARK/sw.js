// Spark service worker — cache-first app shell + notification click handling.
//
// Honest scoping (blueprint §6): the page schedules its own completion
// notification via registration.showNotification() while it is alive (even
// backgrounded). No web API lets this worker reliably wake itself to fire a
// timer alarm after the OS fully suspends the tab/PWA — that would require
// push messages from a server, and Spark has no backend by design. So:
// backgrounded-but-alive tab → notification fires; fully suspended/locked →
// best effort only. This is an OS restriction on all browsers, not a bug.

const CACHE_NAME = 'spark-shell-v6';
const SHELL = [
  './',
  './index.html',
  './styles.css',
  './tasks.js',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-192-maskable.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
  './icons/favicon-16.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Tapping the "time's up" notification focuses (or reopens) the app.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const client = clients.find((c) => 'focus' in c);
      if (client) return client.focus();
      return self.clients.openWindow('./');
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ||
        fetch(event.request).then((res) => {
          // Cache same-origin responses so the app keeps working offline.
          if (res.ok && new URL(event.request.url).origin === self.location.origin) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return res;
        })
    )
  );
});
