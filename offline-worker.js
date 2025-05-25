self.addEventListener('install', function(event) {
  console.log('[SW] Installed');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('[SW] Activated');
});

self.addEventListener('fetch', function(event) {
  // Just pass through the request — no offline caching yet
  return fetch(event.request);
});
