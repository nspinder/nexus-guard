// Service Worker for NexusGuard Push Notifications

self.addEventListener('push', (event) => {
  const data = event.data.json();
  const { title, body, badge, icon, data: notificationData } = data;

  const options = {
    body,
    badge,
    icon,
    tag: notificationData?.tag || 'notification',
    requireInteraction: notificationData?.requireInteraction || false,
    data: notificationData || {},
    actions: [
      {
        action: 'open',
        title: 'View Alert',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title || 'NexusGuard Alert', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Open window or focus existing
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/dashboard');
      }
    })
  );
});

// Handle background notifications
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag);
});
