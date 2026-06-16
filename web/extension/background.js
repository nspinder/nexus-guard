// Background service worker for handling extension messages
console.log('NexusGuard Background: Service worker initialized');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request.type, 'from tab:', sender.tab?.id);

  if (request.type === 'GET_AUTH') {
    chrome.storage.local.get(['authToken', 'userId', 'userEmail'], (data) => {
      console.log('GET_AUTH: Retrieved auth data, token present:', !!data.authToken);
      sendResponse(data || {});
    });
    return true; // Keep channel open for async response
  }

  if (request.type === 'SCAM_DETECTED') {
    console.log('SCAM_DETECTED: Processing scam alert for sender:', request.data?.sender);
    chrome.storage.local.get('alerts', (data) => {
      const alerts = data.alerts || [];
      alerts.unshift({
        ...request.data,
        id: Date.now(),
      });

      // Keep only last 50 alerts
      if (alerts.length > 50) {
        alerts.pop();
      }

      chrome.storage.local.set({ alerts }, () => {
        console.log('Alert stored. Total alerts:', alerts.length);
      });

      // Notify popup if open
      chrome.runtime.sendMessage({
        type: 'UPDATE_ALERTS',
        alerts,
      }).catch((error) => {
        // Popup might not be open
        console.log('Could not notify popup (may not be open):', error.message);
      });
    });

    sendResponse({ success: true });
    return true;
  }

  // Unknown message type
  console.warn('Unknown message type:', request.type);
  sendResponse({ error: 'Unknown message type' });
});

// Clear old alerts on extension startup
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ alerts: [] });
  console.log('NexusGuard extension installed');
});
