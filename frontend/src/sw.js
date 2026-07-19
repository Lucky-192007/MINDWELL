import { precacheAndRoute } from 'workbox-precaching';

// Precache the app shell (injected by vite-plugin-pwa at build time) so the
// UI still loads offline. Journal data itself is NOT cached here - it's
// encrypted server-side and we don't want plaintext sitting in browser cache.
precacheAndRoute(self.__WB_MANIFEST);

// Show a system notification when a push message arrives, even if the app is closed.
self.addEventListener('push', (event) => {
  let data = { title: 'MindWell', body: 'You have a new notification.' };
  try {
    if (event.data) data = event.data.json();
  } catch (e) {
    // fall back to default text above
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon.svg',
      badge: '/icon.svg',
    })
  );
});

// Focus (or open) the app when the notification is tapped
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientsArr) => {
      const existing = clientsArr.find((c) => c.url.includes(self.location.origin));
      if (existing) return existing.focus();
      return self.clients.openWindow('/');
    })
  );
});

self.skipWaiting();
