// Check authentication status on load
document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();
  updatePageStats();
});

function checkAuthStatus() {
  chrome.runtime.sendMessage({ action: 'getAuth' }, (result) => {
    const authSection = document.getElementById('auth-section');
    const authenticatedSection = document.getElementById('authenticated-section');

    if (result.authToken) {
      authSection.style.display = 'none';
      authenticatedSection.style.display = 'block';
      document.getElementById('user-email').textContent = result.userEmail;
    } else {
      authSection.style.display = 'block';
      authenticatedSection.style.display = 'none';
    }
  });
}

// Login button
document.getElementById('login-btn').addEventListener('click', () => {
  const email = document.getElementById('email').value;
  const token = document.getElementById('token').value;

  if (!email || !token) {
    alert('Please fill in all fields');
    return;
  }

  chrome.runtime.sendMessage({
    action: 'setAuth',
    authToken: token,
    userId: 'user-' + Date.now(),
    userEmail: email,
  }, () => {
    checkAuthStatus();
  });
});

// Logout button
document.getElementById('logout-btn').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'clearAuth' }, () => {
    checkAuthStatus();
  });
});

// Scan button
document.getElementById('scan-btn').addEventListener('click', () => {
  const url = document.getElementById('scan-input').value;
  if (!url) {
    alert('Please enter a URL');
    return;
  }

  scanAndDisplay(url);
});

// Scan all links on page
document.getElementById('scan-page-btn').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'scanAllLinks' }, (results) => {
      if (results) {
        const suspicious = results.filter(r => r.result && r.result.threatLevel !== 'none');
        const resultHtml = `
          <p><strong>Scan Results:</strong></p>
          <p>Total links: ${results.length}</p>
          <p>Suspicious: ${suspicious.length}</p>
          ${suspicious.length > 0 ? `
            <details open>
              <summary>Suspicious Links:</summary>
              <ul>
                ${suspicious.map(r => `<li>${r.result.threatLevel.toUpperCase()}: ${escapeHtml(r.url)}</li>`).join('')}
              </ul>
            </details>
          ` : '<p>✅ All links appear safe!</p>'}
        `;
        displayResult(resultHtml);
      }
    });
  });
});

function scanAndDisplay(url) {
  chrome.runtime.sendMessage({ action: 'scanURL', url }, (result) => {
    if (result.error) {
      displayResult(`<p style="color: #ef4444;">⚠️ ${result.error}</p>`);
      return;
    }

    let threatIcon = '✅';
    let threatColor = '#22c55e';
    let threatText = 'SAFE';

    if (result.threatLevel === 'danger') {
      threatIcon = '🚨';
      threatColor = '#ef4444';
      threatText = 'MALICIOUS';
    } else if (result.threatLevel === 'warning') {
      threatIcon = '⚠️';
      threatColor = '#f97316';
      threatText = 'SUSPICIOUS';
    }

    const html = `
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
        <span style="font-size: 24px;">${threatIcon}</span>
        <span style="color: ${threatColor}; font-weight: 600; font-size: 16px;">${threatText}</span>
      </div>
      <p><strong>URL:</strong></p>
      <code style="word-break: break-all; font-size: 11px;">${escapeHtml(url)}</code>
      ${result.sources && result.sources.length > 0 ? `
        <p style="margin-top: 12px;"><strong>Detected by:</strong> ${result.sources.join(', ')}</p>
      ` : ''}
      ${result.threats && result.threats.length > 0 ? `
        <p style="margin-top: 12px;"><strong>Threats:</strong></p>
        <ul style="margin: 6px 0; padding-left: 18px; font-size: 12px;">
          ${result.threats.map(t => `<li>${escapeHtml(t)}</li>`).join('')}
        </ul>
      ` : ''}
      ${result.riskLevel ? `
        <p style="margin-top: 8px;"><strong>Risk:</strong> ${result.riskLevel.toUpperCase()}</p>
      ` : ''}
    `;

    displayResult(html);
  });
}

function displayResult(html) {
  const resultSection = document.getElementById('scan-result');
  const resultContent = document.getElementById('result-content');

  // Clear previous content safely
  resultContent.textContent = '';

  // Create a temporary container to parse the HTML safely
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Clone nodes to sanitize (removes script tags and event handlers)
  while (temp.firstChild) {
    resultContent.appendChild(temp.firstChild);
  }

  resultSection.style.display = 'block';
}

function updatePageStats() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) return;
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: 'getPageStats' },
      (response) => {
        // This will be updated when we implement the page stats
      }
    );
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
