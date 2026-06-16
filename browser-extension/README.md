# NexusGuard Browser Extension

Real-time protection against phishing, scams, and malicious links. Scan URLs before you click.

## Features

- **Real-time Link Scanning**: Automatically scans all links on web pages and shows threat indicators
- **Threat Badge System**: 
  - 🚨 Malicious (known phishing/malware sites)
  - ⚠️ Suspicious (has suspicious patterns)
  - ✅ Safe (no threats detected)
- **URL Scanner Tool**: Manually scan any URL directly from the popup
- **Scan All Links**: Analyze all links on a page at once with summary statistics
- **Threat Details**: Click on threat badges to see detailed analysis including:
  - Vendor detection sources (VirusTotal, Google Safe Browsing)
  - List of detected threats
  - Risk levels and warnings

## Installation

### Development Mode

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `/Users/spinderfam/nexus-guard/browser-extension` directory
5. The extension should appear in your extensions list

### First Time Setup

1. Click the NexusGuard extension icon in the top right of Chrome
2. Enter your NexusGuard account credentials:
   - **Email**: Your NexusGuard account email
   - **Auth Token**: Get this from http://localhost:3000 (NexusGuard Dashboard)
3. Click "Login"

## Usage

### Automatic Scanning
- When you visit any website, all links are automatically scanned
- Malicious or suspicious links show threat badges:
  - Red badge with 🚨 for malicious sites
  - Orange badge with ⚠️ for suspicious patterns
- Click any badge to see detailed threat information

### Manual URL Scanning
1. Click the NexusGuard extension icon
2. Enter a URL in the scanner form
3. Click "Scan"
4. View the threat assessment immediately

### Scan All Links on Page
1. Click "Scan All Links" button at the bottom of the popup
2. Extension will analyze all links on the current page
3. See summary with total links and suspicious count
4. View list of flagged links with their threat levels

### Logging Out
- Click the power button (⏚) in the popup header to log out
- You'll be prompted to log in again on the next use

## File Structure

- `manifest.json` - Extension configuration (Manifest V3)
- `background.js` - Service worker handling API calls and caching
- `content.js` - Content script injected on all pages for link scanning
- `content.css` - Styling for threat badges and modal popups
- `popup.html` - Extension popup interface
- `popup.js` - Popup logic and user interactions
- `popup.css` - Popup styling
- `images/` - Extension icons

## How It Works

1. **Link Detection**: Content script scans page for all `<a>` links and dynamically added content
2. **API Calls**: Each link is sent to NexusGuard backend for scanning
3. **Multi-layer Analysis**:
   - VirusTotal API - Check against known threat databases
   - Google Safe Browsing API - Phishing/malware detection
   - Pattern Analysis - Shortened URLs, suspicious TLDs, homograph attacks
4. **Caching**: Results cached for 1 hour to minimize API calls
5. **Visual Feedback**: Threat badges injected into page with hover details
6. **Modal Popups**: Click badges to see detailed threat analysis

## Backend Requirements

The extension requires NexusGuard backend running at:
- API: `http://localhost:3001`

Ensure the following endpoints are available:
- `POST /api/url/scan` - Scan single URL
- `POST /api/url/extract-and-scan` - Extract and scan URLs from text

Authentication headers required:
- `Authorization: Bearer {authToken}`
- `X-User-Id: {userId}`
- `X-User-Email: {userEmail}`

## Troubleshooting

### "Please enter a URL" error
- Make sure you enter a complete URL with `http://` or `https://`

### Links not showing badges
- Extension may not have permission on that site
- Try visiting a different website
- Check that you're logged in (popup shows user email)

### "Failed to analyze" error
- Check backend is running on `localhost:3001`
- Verify auth token is valid
- Check browser console for detailed error messages

### Not getting alerts on page load
- Refresh the page to re-scan all links
- Check browser console for any errors
- Ensure content script loaded (check DevTools → Application → Service Workers)

## Development

To modify the extension:

1. Edit files in `/Users/spinderfam/nexus-guard/browser-extension/`
2. Go to `chrome://extensions/`
3. Click the refresh icon on NexusGuard card to reload
4. Changes apply immediately

Open DevTools for debugging:
- Right-click on page → Inspect
- Open DevTools for service worker: Go to `chrome://extensions/` → NexusGuard → "Service Worker"
