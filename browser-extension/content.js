// Listen for page loaded message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'pageLoaded') {
    scanPageLinks();
  }

  if (request.action === 'scanAllLinks') {
    scanAllLinksAndReturn().then(results => {
      sendResponse(results);
    });
    return true;
  }
});

async function scanAllLinksAndReturn() {
  const links = document.querySelectorAll('a[href]');
  const results = [];

  for (const link of links) {
    const url = link.href;
    if (url.startsWith('http')) {
      const result = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: 'scanURL', url }, (result) => {
          resolve(result);
        });
      });
      results.push({
        url,
        result,
      });
    }
  }

  return results;
}

// Scan all links on page
async function scanPageLinks() {
  const links = document.querySelectorAll('a[href]');

  for (const link of links) {
    const url = link.href;

    // Skip non-http links
    if (!url.startsWith('http')) {
      continue;
    }

    // Skip if already has our badge
    if (link.querySelector('[data-nexus-guard]')) {
      continue;
    }

    // Scan the URL
    chrome.runtime.sendMessage({ action: 'scanURL', url }, (result) => {
      if (result && !result.error) {
        addBadgeToLink(link, result);
      }
    });
  }
}

// Add visual badge to link
function addBadgeToLink(link, result) {
  // Don't show badge for safe links without warnings
  if (result.threatLevel === 'none' || !result.threats || result.threats.length === 0) {
    return;
  }

  // Create badge element
  const badge = document.createElement('span');
  badge.setAttribute('data-nexus-guard', 'true');
  badge.className = `nexus-guard-badge nexus-${result.threatLevel}`;

  if (result.threatLevel === 'danger') {
    badge.textContent = '🚨';
    badge.title = 'MALICIOUS: Known phishing/malware site';
  } else if (result.threatLevel === 'warning') {
    badge.textContent = '⚠️';
    badge.title = 'SUSPICIOUS: Has suspicious patterns';
  }

  // Add hover tooltip
  badge.style.cursor = 'pointer';
  badge.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showDetailedAnalysis(result);
  });

  // Insert badge before link text
  link.insertBefore(badge, link.firstChild);

  // Add visual indicator to link itself
  if (result.threatLevel === 'danger') {
    link.style.borderBottom = '2px solid #ef4444';
    link.style.textDecoration = 'line-through';
  } else if (result.threatLevel === 'warning') {
    link.style.borderBottom = '2px dashed #f97316';
  }
}

// Show detailed analysis popup
function showDetailedAnalysis(result) {
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'nexus-guard-modal';

  const content = document.createElement('div');
  content.className = 'nexus-guard-modal-content';

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

  content.innerHTML = `
    <div class="modal-header">
      <span style="font-size: 24px; margin-right: 10px;">${threatIcon}</span>
      <h3 style="margin: 0; color: ${threatColor};">${threatText}</h3>
      <button class="modal-close">×</button>
    </div>
    <div class="modal-body">
      <p><strong>URL:</strong> <code>${escapeHtml(result.url)}</code></p>
      ${result.sources && result.sources.length > 0 ? `
        <p><strong>Detected by:</strong> ${result.sources.join(', ')}</p>
      ` : ''}
      ${result.threats && result.threats.length > 0 ? `
        <p><strong>Threats:</strong></p>
        <ul>
          ${result.threats.map(t => `<li>${escapeHtml(t)}</li>`).join('')}
        </ul>
      ` : ''}
      ${result.riskLevel ? `
        <p><strong>Risk Level:</strong> ${result.riskLevel.toUpperCase()}</p>
      ` : ''}
    </div>
    <div class="modal-footer">
      <p style="font-size: 12px; color: #64748b; margin: 0;">
        ℹ️ Be cautious when clicking suspicious links. When in doubt, contact the sender directly.
      </p>
    </div>
  `;

  modal.appendChild(content);
  document.body.appendChild(modal);

  // Close on X button
  content.querySelector('.modal-close').addEventListener('click', () => {
    modal.remove();
  });

  // Close on outside click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Utility to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Scan links on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scanPageLinks);
} else {
  scanPageLinks();
}

// Re-scan when new links are added to page (AJAX)
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.addedNodes.length) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === 1) { // Element node
          const links = node.querySelectorAll ? node.querySelectorAll('a[href]') : [];
          if (node.tagName === 'A') {
            links.push(node);
          }

          for (const link of links) {
            chrome.runtime.sendMessage({ action: 'scanURL', url: link.href }, (result) => {
              if (result && !result.error && result.threatLevel !== 'none') {
                addBadgeToLink(link, result);
              }
            });
          }
        }
      }
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
