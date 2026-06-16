const API_BASE_URL = 'http://localhost:3001';

// Store scan results in cache
const scanCache = {};

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scanURL') {
    scanURL(request.url).then(result => {
      sendResponse(result);
    }).catch(error => {
      sendResponse({ error: error.message });
    });
    return true; // Keep channel open for async response
  }

  if (request.action === 'getScanResult') {
    const cached = scanCache[request.url];
    if (cached) {
      sendResponse(cached);
    } else {
      sendResponse(null);
    }
  }
});

async function scanURL(url) {
  // Check cache first
  if (scanCache[url]) {
    return scanCache[url];
  }

  try {
    const authToken = await chrome.storage.local.get('authToken');
    const userId = await chrome.storage.local.get('userId');
    const userEmail = await chrome.storage.local.get('userEmail');

    if (!authToken.authToken) {
      return {
        error: 'Not authenticated. Please log in on NexusGuard.',
        url,
      };
    }

    const response = await fetch(`${API_BASE_URL}/api/url/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken.authToken}`,
        'X-User-Id': userId.userId,
        'X-User-Email': userEmail.userEmail,
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error('Failed to scan URL');
    }

    const data = await response.json();
    const result = {
      ...data.data,
      cachedAt: Date.now(),
    };

    // Cache the result for 1 hour
    scanCache[url] = result;
    setTimeout(() => {
      delete scanCache[url];
    }, 3600000);

    return result;
  } catch (error) {
    console.error('Error scanning URL:', error);
    return {
      error: error.message,
      url,
    };
  }
}


// Track tab changes for real-time scanning
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Notify content script that page loaded
    chrome.tabs.sendMessage(tabId, {
      action: 'pageLoaded',
      url: tab.url,
    }).catch(() => {
      // Content script not available on this page
    });
  }
});

// Store auth token from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'setAuth') {
    chrome.storage.local.set({
      authToken: request.authToken,
      userId: request.userId,
      userEmail: request.userEmail,
    });
    sendResponse({ success: true });
  }

  if (request.action === 'clearAuth') {
    chrome.storage.local.clear();
    sendResponse({ success: true });
  }

  if (request.action === 'getAuth') {
    chrome.storage.local.get(['authToken', 'userId', 'userEmail'], (result) => {
      sendResponse(result);
    });
    return true;
  }
});
