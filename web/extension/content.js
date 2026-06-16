// WhatsApp Web message monitoring
console.log('═══════════════════════════════════════');
console.log('🔍 NexusGuard WhatsApp Monitor - Loading');
console.log('═══════════════════════════════════════');
console.log('Page URL:', window.location.href);
console.log('Timestamp:', new Date().toISOString());

// Store authentication info
let authToken = null;
let userId = null;
let userEmail = null;

// Initialize authentication from background script
let authAttempts = 0;
const MAX_AUTH_ATTEMPTS = 5;

function initAuth() {
  authAttempts++;

  if (authAttempts > MAX_AUTH_ATTEMPTS) {
    console.warn('NexusGuard: Max auth attempts reached, giving up on auth init');
    return;
  }

  console.log(`NexusGuard: Auth attempt ${authAttempts}/${MAX_AUTH_ATTEMPTS}`);

  try {
    chrome.runtime.sendMessage({ type: 'GET_AUTH' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('NexusGuard: sendMessage error:', chrome.runtime.lastError.message);
        // Only retry on certain errors
        if (chrome.runtime.lastError.message?.includes('context')) {
          console.log('NexusGuard: Extension context issue, will retry in 3s');
          setTimeout(initAuth, 3000);
        }
        return;
      }

      if (response && response.authToken) {
        authToken = response.authToken;
        userId = response.userId;
        userEmail = response.userEmail;
        console.log('✓ NexusGuard authenticated:', { email: userEmail, userId });
        startObserving();
      } else {
        console.warn('NexusGuard: Not authenticated. Please login via extension popup.');
        // Try again in case popup is being set up
        if (authAttempts < 3) {
          setTimeout(initAuth, 2000);
        }
      }
    });
  } catch (error) {
    console.error('NexusGuard: Auth initialization error:', error.message);
    if (authAttempts < MAX_AUTH_ATTEMPTS) {
      setTimeout(initAuth, 3000);
    }
  }
}

// Try auth after document is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuth);
} else {
  initAuth();
}

// Try again after a delay to catch late popup login
setTimeout(initAuth, 2000);

// Monitor for new messages using MutationObserver
let mutationCount = 0;
let messageFoundCount = 0;

const observer = new MutationObserver((mutations) => {
  mutationCount++;

  // Log every 200 mutations or if messages found
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Check for message selectors - use the ones that actually work
          const messageSelectors = [
            '[data-testid*="msg"]',     // Finds 81 elements
            '[data-testid*="message"]', // Fallback
            '[role="row"]'              // Secondary option
          ];

          let foundMessages = [];
          for (const selector of messageSelectors) {
            const matches = Array.from(node.querySelectorAll(selector));
            foundMessages = foundMessages.concat(matches);
          }

          // Remove duplicates
          foundMessages = [...new Set(foundMessages)];

          if (foundMessages.length > 0) {
            messageFoundCount += foundMessages.length;
            console.log(`📬 Found ${foundMessages.length} potential message element(s) (total: ${messageFoundCount})`);
            foundMessages.forEach(analyzeMessage);
          }

          // Check if the node itself is a message
          if (node.getAttribute) {
            const testid = node.getAttribute('data-testid') || '';
            if (testid.includes('msg')) {
              console.log('🔔 Analyzing new message node directly');
              analyzeMessage(node);
            }
          }
        }
      });
    }
  });

  if (mutationCount % 500 === 0) {
    console.log(`📊 Observer alive: ${mutationCount} mutations detected, ${messageFoundCount} messages found`);
  }
});

// Track observer setup attempts
let observerSetupAttempts = 0;
const MAX_OBSERVER_ATTEMPTS = 10;
let observerStarted = false;

function startObserving() {
  observerSetupAttempts++;

  if (observerSetupAttempts > MAX_OBSERVER_ATTEMPTS) {
    console.warn('NexusGuard: Max observer setup attempts reached');
    return;
  }

  console.log(`NexusGuard: startObserving attempt ${observerSetupAttempts}, authToken: ${authToken ? 'present' : 'missing'}`);

  if (!authToken) {
    console.warn('NexusGuard: Waiting for authentication...');
    setTimeout(startObserving, 1000);
    return;
  }

  // Try multiple selectors for the chat container
  const selectors = [
    '.two',           // Main chat container in current WhatsApp Web
    '#pane-side',     // Sidebar
    '[role="main"]',
    'div[class*="pane"]',
    'main'
  ];

  let chatContainer = null;
  for (const selector of selectors) {
    chatContainer = document.querySelector(selector);
    if (chatContainer) {
      console.log(`✓ Found chat container with selector: ${selector}`);
      break;
    }
  }

  if (!chatContainer) {
    console.log(`Chat container not found (attempt ${observerSetupAttempts}), retrying in 1s...`);
    setTimeout(startObserving, 1000);
    return;
  }

  if (!observerStarted) {
    try {
      observer.observe(chatContainer, {
        childList: true,
        subtree: true,
        characterData: false,
      });
      observerStarted = true;
      console.log('✓ NexusGuard: MutationObserver successfully started');
      console.log('✓ Now monitoring for new WhatsApp messages...');

      // Scan existing messages in the chat
      console.log('🔍 Scanning existing messages in this chat...');
      const existingMessages = chatContainer.querySelectorAll('[data-testid*="msg"]');
      console.log(`Found ${existingMessages.length} existing messages to analyze`);

      if (existingMessages.length > 0) {
        existingMessages.forEach((msg, index) => {
          // Stagger analysis to avoid rate limits
          setTimeout(() => {
            analyzeMessage(msg);
          }, index * 200); // 200ms delay between each message
        });
      }
    } catch (error) {
      console.error('NexusGuard: Error starting observer:', error);
      observerStarted = false;
    }
  }
}

// Track analyzed messages to avoid duplicates
const analyzedMessageIds = new Set();

// Extract and analyze message
async function analyzeMessage(messageElement) {
  try {
    if (!messageElement) {
      return;
    }

    // Extract message text from the span with data-testid containing 'msg'
    let messageText = '';

    // Try to find the text content within the message element
    const textSpans = messageElement.querySelectorAll('span[class*="selectable"], span, div[class*="message"], [data-testid*="msg"]');
    for (const span of textSpans) {
      const text = span.innerText?.trim();
      if (text && text.length > 2 && !text.includes('(You)') && !text.match(/^\d{1,2}:\d{2}$/)) {
        messageText = text;
        break;
      }
    }

    // Fallback: get all text from the element
    if (!messageText) {
      messageText = messageElement.innerText?.trim() || '';
    }

    // Clean up the text (remove sender name, time, etc.)
    messageText = messageText
      .split('\n')
      .filter(line => !line.match(/^\d{1,2}:\d{2}/) && !line.includes('(You)') && line.trim().length > 0)
      .join(' ')
      .trim();

    if (!messageText || messageText.length < 5) {
      return;
    }

    // Create a simple ID based on text to avoid duplicates
    const messageId = messageText.substring(0, 30) + messageText.length;

    if (analyzedMessageIds.has(messageId)) {
      return;
    }
    analyzedMessageIds.add(messageId);

    // Get sender name from the message
    let sender = 'Unknown';

    // Try to get sender from the message row container
    const messageRow = messageElement.closest('[role="row"]');
    if (messageRow) {
      // Look for sender name in the row
      const senderSpan = messageRow.querySelector('[data-testid*="sender"], span');
      if (senderSpan?.innerText) {
        sender = senderSpan.innerText.split('\n')[0].trim();
      }
    }

    // Fallback: Try to get from the chat header at the top
    if (sender === 'Unknown') {
      const chatHeader = document.querySelector('[data-testid*="chat-header"], [class*="title"]');
      if (chatHeader?.innerText) {
        sender = chatHeader.innerText.split('\n')[0].trim();
      }
    }

    // Clean up sender name
    if (sender.includes('(You)')) {
      sender = 'You';
    }

    // Only analyze if authenticated
    if (!authToken) {
      console.warn('NexusGuard: Cannot analyze - not authenticated');
      return;
    }

    console.log('📱 Analyzing message from:', sender.substring(0, 30), 'Preview:', messageText.substring(0, 40) + '...');

    // Send to backend for analysis
    const response = await fetch('http://localhost:3001/api/whatsapp/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'X-User-Id': userId,
        'X-User-Email': userEmail,
      },
      body: JSON.stringify({
        sender,
        messageText,
        platform: 'whatsapp',
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Analysis failed (status ' + response.status + '):', errorData.substring(0, 100));
      return;
    }

    const result = await response.json();

    // Show alert if scam detected
    if (result.analysis.probability > 70) {
      console.log('🚨 HIGH RISK - Scam probability:', result.analysis.probability + '%');
      showAlert(sender, messageText, result.analysis.probability);
    } else {
      console.log('✓ Safe message (probability: ' + result.analysis.probability + '%)');
    }

  } catch (error) {
    console.error('Error analyzing message:', error.message);
  }
}

// Show visual alert in extension
function showAlert(sender, message, probability) {
  // Send message to popup
  chrome.runtime.sendMessage({
    type: 'SCAM_DETECTED',
    data: {
      sender,
      message: message.substring(0, 100),
      probability,
      platform: 'whatsapp',
      timestamp: new Date().toISOString(),
    },
  }).catch(() => {
    // Popup might not be open, that's ok
  });

  // Also show browser notification
  if (Notification.permission === 'granted') {
    new Notification('🚨 NexusGuard Scam Alert', {
      body: `Suspicious WhatsApp message from ${sender} (${probability}% scam probability)`,
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23ef4444" width="100" height="100"/><text x="50" y="65" font-size="60" fill="white" text-anchor="middle">⚠</text></svg>',
    });
  }
}

// Request notification permission
if (Notification.permission === 'default') {
  Notification.requestPermission().then(permission => {
    console.log('Notification permission:', permission);
  });
}

// Listen for scan requests from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SCAN_CHAT') {
    console.log('Received scan request:', request.target);

    if (request.target === 'current') {
      scanCurrentChat().then(count => {
        sendResponse({ success: true, messageCount: count });
      });
    } else if (request.target === 'all') {
      scanAllChats().then(count => {
        sendResponse({ success: true, messageCount: count });
      });
    }
    return true; // Keep channel open for async response
  }
});

// Scan current chat
async function scanCurrentChat() {
  console.log('🔍 Manually scanning current chat...');
  const chatContainer = document.querySelector('.two') || document.querySelector('#pane-side');

  if (!chatContainer) {
    console.warn('Chat container not found');
    return 0;
  }

  const messages = chatContainer.querySelectorAll('[data-testid*="msg"]');
  console.log(`Found ${messages.length} messages to scan`);

  let analyzed = 0;
  for (let i = 0; i < messages.length; i++) {
    await new Promise(resolve => {
      setTimeout(() => {
        analyzeMessage(messages[i]);
        analyzed++;
        resolve();
      }, 150); // 150ms between messages to avoid rate limiting
    });
  }

  console.log(`✓ Finished scanning. Analyzed ${analyzed} messages`);
  return analyzed;
}

// Scan all chats
async function scanAllChats() {
  console.log('🔍 Manually scanning ALL chats...');

  // Find the sidebar with all chat items
  const sidebar = document.querySelector('[data-testid*="chat-list"], .x1n2onr6');
  if (!sidebar) {
    console.warn('Sidebar not found');
    return 0;
  }

  // Get all conversation items
  const chatItems = sidebar.querySelectorAll('[role="button"], [role="row"]');
  console.log(`Found ${chatItems.length} chat items`);

  let totalAnalyzed = 0;

  // Click on each chat and scan it
  for (let i = 0; i < Math.min(chatItems.length, 15); i++) { // Limit to first 15 chats for safety
    try {
      const chatItem = chatItems[i];
      const chatName = chatItem.innerText?.split('\n')[0] || `Chat ${i + 1}`;
      console.log(`📱 Opening chat: ${chatName}`);

      // Click the chat
      chatItem.click();

      // Wait for chat to load
      await new Promise(resolve => setTimeout(resolve, 800));

      // Scan messages in this chat
      const chatContainer = document.querySelector('.two');
      if (chatContainer) {
        const messages = chatContainer.querySelectorAll('[data-testid*="msg"]');
        console.log(`  → Found ${messages.length} messages in this chat`);

        for (let j = 0; j < messages.length; j++) {
          await new Promise(resolve => {
            setTimeout(() => {
              analyzeMessage(messages[j]);
              totalAnalyzed++;
              resolve();
            }, 100);
          });
        }
      }
    } catch (error) {
      console.error(`Error processing chat ${i}:`, error.message);
    }
  }

  console.log(`✓ Finished scanning all chats. Total analyzed: ${totalAnalyzed} messages`);
  return totalAnalyzed;
}

// Log initialization complete
console.log('═══════════════════════════════════════');
console.log('✓ NexusGuard initialization complete');
console.log('Status: Awaiting authentication...');
console.log('═══════════════════════════════════════');
