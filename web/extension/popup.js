// Check if authenticated and show appropriate section
function checkAuth() {
  console.log('Checking auth...');
  chrome.storage.local.get('authToken', (data) => {
    console.log('Auth check result:', data);
    if (data.authToken) {
      console.log('Authenticated - showing alerts');
      document.getElementById('loginSection').style.display = 'none';
      document.getElementById('alertsList').style.display = 'block';
      loadAlerts();
    } else {
      console.log('Not authenticated - showing login');
      document.getElementById('loginSection').style.display = 'block';
      document.getElementById('alertsList').style.display = 'none';
    }
  });
}

// Handle login
document.getElementById('loginBtn')?.addEventListener('click', async () => {
  const email = document.getElementById('emailInput').value;
  const password = document.getElementById('passwordInput').value;
  const errorEl = document.getElementById('loginError');

  if (!email || !password) {
    errorEl.textContent = 'Email and password required';
    errorEl.style.display = 'block';
    return;
  }

  try {
    const token = btoa(`${email}:${password}`);
    const userId = `user-${Date.now()}`;

    // Verify credentials by making a test API call
    const response = await fetch('http://localhost:3001/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-User-Id': userId,
        'X-User-Email': email,
      },
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    // Store auth info
    chrome.storage.local.set({
      authToken: token,
      userId,
      userEmail: email,
    }, () => {
      checkAuth();
      document.getElementById('emailInput').value = '';
      document.getElementById('passwordInput').value = '';
    });
  } catch (error) {
    errorEl.textContent = 'Login failed: ' + error.message;
    errorEl.style.display = 'block';
  }
});

// Load and display alerts
function loadAlerts() {
  chrome.storage.local.get('alerts', (data) => {
    const alerts = data.alerts || [];
    const alertsList = document.getElementById('alertsList');

    if (alerts.length === 0) {
      alertsList.innerHTML = `
        <div class="empty">
          <p>👂 Monitoring WhatsApp...</p>
          <p style="font-size: 11px; margin-top: 8px;">Suspicious messages will appear here</p>
        </div>
      `;
      return;
    }

    alertsList.innerHTML = alerts.map((alert) => {
      const riskClass = alert.probability > 85 ? 'critical' : alert.probability > 70 ? 'high' : 'medium';
      const time = new Date(alert.timestamp).toLocaleTimeString();

      return `
        <div class="alert-item ${riskClass}">
          <div class="alert-sender">📱 ${escapeHtml(alert.sender)}</div>
          <div class="alert-message">"${escapeHtml(alert.message)}..."</div>
          <div class="alert-score">
            <span>Scam Probability</span>
            <span class="score-value ${riskClass}">${alert.probability}%</span>
          </div>
          <div class="alert-time">${time}</div>
        </div>
      `;
    }).join('');
  });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Listen for alert updates
chrome.runtime.onMessage.addListener((request) => {
  if (request.type === 'UPDATE_ALERTS') {
    loadAlerts();
  }
});

// Handle scan buttons
document.getElementById('scanThisChatBtn')?.addEventListener('click', () => {
  console.log('Scan This Chat clicked');
  showScanProgress('Scanning current chat...');

  // Send message to content script to scan current chat
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      type: 'SCAN_CHAT',
      target: 'current'
    }, (response) => {
      if (response && response.success) {
        console.log('Scan completed:', response.messageCount);
        hideScanProgress();
        setTimeout(() => loadAlerts(), 1000);
      }
    });
  });
});

document.getElementById('scanAllChatsBtn')?.addEventListener('click', () => {
  console.log('Scan All Chats clicked');
  showScanProgress('Scanning all chats... (this may take a while)');

  // Send message to content script to scan all chats
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      type: 'SCAN_CHAT',
      target: 'all'
    }, (response) => {
      if (response && response.success) {
        console.log('Scan completed:', response.messageCount);
        hideScanProgress();
        setTimeout(() => loadAlerts(), 2000);
      }
    });
  });
});

function showScanProgress(message) {
  document.getElementById('scanProgress').style.display = 'block';
  document.getElementById('scanProgressText').textContent = message;
}

function hideScanProgress() {
  document.getElementById('scanProgress').style.display = 'none';
}

// Check auth and show appropriate view on popup open
checkAuth();

// Refresh every 2 seconds
setInterval(() => {
  chrome.storage.local.get('authToken', (data) => {
    if (data.authToken) {
      loadAlerts();
    }
  });
}, 2000);
