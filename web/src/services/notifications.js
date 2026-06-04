export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function sendNotification(title, options = {}) {
  if ('Notification' in window && Notification.permission === 'granted') {
    return new Notification(title, {
      icon: '/nexus-guard-icon.png',
      badge: '/nexus-guard-badge.png',
      ...options,
    });
  }
}

export async function subscribeToNotifications(authToken) {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Workers not supported');
    return false;
  }

  try {
    // Register service worker
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    console.log('✓ Service Worker registered');

    // Request notification permission
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log('Notification permission denied');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Notification setup error:', error);
    return false;
  }
}

export async function notifyScamDetected(scamData) {
  const { type, probability, sender, phoneNumber } = scamData;

  const title = `🚨 Potential Scam Detected!`;
  const body = type === 'email'
    ? `Email from ${sender} (${probability}% likely scam)`
    : `Call from ${phoneNumber} (${probability}% likely scam)`;

  sendNotification(title, {
    body,
    tag: `scam-${type}-${Date.now()}`,
    requireInteraction: probability > 85, // Require interaction for very high probability
    data: scamData,
  });
}
