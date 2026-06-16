# NexusGuard WhatsApp Extension

Real-time scam detection for WhatsApp Web messages.

## Installation

### Step 1: Load the Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Navigate to `/Users/spinderfam/nexus-guard/web/extension`
5. Select the folder and click **Open**

You should now see "NexusGuard - WhatsApp Scam Detection" in your extensions list.

### Step 2: Log in to NexusGuard

1. Go to http://localhost:3000
2. Log in with your email and password
3. This saves your auth token to localStorage

### Step 3: Open WhatsApp Web

1. Go to https://web.whatsapp.com
2. Scan the QR code with your phone to log in
3. The extension will start monitoring for messages

### Step 4: View Alerts

Click the NexusGuard extension icon in your Chrome toolbar to see detected scam messages in real-time.

## How It Works

1. **Message Detection**: Extension monitors WhatsApp Web for new messages
2. **Analysis**: Messages are sent to the backend for scam analysis using Claude AI
3. **Real-Time Alerts**: Suspicious messages show up in the extension popup and as browser notifications
4. **History**: All analyzed messages are stored in your dashboard under WhatsApp History

## Features

✅ Real-time message monitoring  
✅ Scam probability scoring  
✅ Browser notifications  
✅ Message history & deletion  
✅ Safe - authentication required  

## Troubleshooting

**Messages not being detected?**
- Make sure you're logged into WhatsApp Web
- Check that you're logged into NexusGuard (check localStorage)
- Check Chrome DevTools Console (F12) for any errors

**Alerts not showing?**
- Make sure the backend server is running on http://localhost:3001
- Check that your authentication token is valid
- Verify notification permissions are allowed

**Need to update the extension?**
- Make changes to the files
- Go to chrome://extensions/
- Click the refresh icon on the NexusGuard extension

## Files

- `manifest.json` - Extension configuration
- `content.js` - Runs on WhatsApp Web, monitors messages
- `background.js` - Handles messages from content script
- `popup.html` - Extension popup UI
- `popup.js` - Popup functionality
