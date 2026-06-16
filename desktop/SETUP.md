# NexusGuard Desktop App Setup Guide

## Overview
NexusGuard Desktop monitors WhatsApp calls on macOS, records them, transcribes the audio, and analyzes them for scam indicators.

## Prerequisites

### 1. Install System Dependencies
```bash
# Install ffmpeg (for audio recording)
brew install ffmpeg

# Install Node.js if not already installed
# Download from https://nodejs.org/ or use brew
brew install node
```

### 2. Get API Keys
You'll need API keys for:

**Deepgram (Speech-to-Text)**
1. Go to https://console.deepgram.com
2. Sign up for a free account
3. Create an API key
4. Note the key (you'll need it during setup)

**NexusGuard Backend**
- Backend URL: `http://localhost:3001` (or your deployed backend)
- User credentials from your NexusGuard account

## Installation

1. **Install Dependencies**
```bash
cd desktop
npm install electron axios form-data
```

2. **Create .env file** in the desktop folder:
```bash
cp .env.example .env
```

3. **Edit `.env` with your credentials:**
```
# Backend Configuration
BACKEND_URL=http://localhost:3001
AUTH_TOKEN=your_auth_token_here
USER_ID=your_user_id_here
USER_EMAIL=your_email@example.com

# Speech-to-Text Configuration
STT_PROVIDER=deepgram
STT_API_KEY=your_deepgram_api_key_here

# Optional: for Google Cloud Speech-to-Text
# STT_PROVIDER=google
# GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

## Running the App

### Development Mode
```bash
cd desktop
npm start
```

The app will open with DevTools enabled for debugging.

### Production Build
```bash
cd desktop
npm run build
```

## Permissions Required

When you first run the app, you may see permission dialogs:

1. **Microphone Access**: Allow to record call audio
2. **Screen Recording**: Allow to detect WhatsApp activity (macOS 10.15+)
3. **Accessibility**: Allow to interact with WhatsApp

### Grant Permissions:
1. Open System Preferences → Security & Privacy
2. Go to Microphone tab
3. Find and allow "NexusGuard"
4. Go to Screen Recording tab
5. Find and allow "Electron"

## How It Works

1. **Call Detection**: Monitors for WhatsApp Desktop calls
2. **Recording**: Captures audio when a call is active
3. **Transcription**: Sends audio to Deepgram for transcription
4. **Analysis**: Analyzes transcript with Claude for scam indicators
5. **Alerts**: Shows risk level and specific red flags found
6. **Storage**: Keeps recordings locally in `~/.nexusguard/recordings/`

## Privacy & Security

- **Local Recording**: All audio files are stored locally on your machine
- **Encryption**: Audio files are encrypted (in future versions)
- **Transmission**: Only transcripts are sent to backend (not audio)
- **Consent**: Audio recording only happens with your explicit consent
- **Cleanup**: Old recordings (>7 days) are automatically deleted

## Troubleshooting

### ffmpeg not found
```bash
brew install ffmpeg
```

### Deepgram API errors
- Check your API key is correct
- Verify you have a Deepgram account with an active API key
- Check your account has available credits

### Backend connection errors
- Ensure backend is running: `npm run dev` in `/server`
- Check `BACKEND_URL` in `.env`
- Verify you're using correct auth credentials

### Audio not being recorded
- Check System Preferences for microphone permissions
- Ensure ffmpeg is installed
- Try running with `--dev` flag to see detailed logs

## Development Notes

### File Structure
```
desktop/
├── src/
│   ├── main.js              # Electron main process
│   ├── callMonitor.js       # WhatsApp call detection
│   ├── audioRecorder.js     # FFmpeg audio capture
│   ├── scamAnalyzer.js      # Backend communication
│   ├── preload.js           # Electron preload script
│   └── ui/
│       ├── index.html       # UI layout
│       ├── style.css        # Styling
│       └── renderer.js      # UI interactions
├── package.json
├── .env.example
└── SETUP.md
```

### Adding New Features
1. Backend analysis → Edit `scamAnalyzer.js`
2. Call detection → Edit `callMonitor.js`
3. Recording setup → Edit `audioRecorder.js`
4. UI changes → Edit files in `ui/`

## Future Enhancements

- [ ] Audio encryption at rest
- [ ] Cloud backup of call analysis
- [ ] Integration with mobile app
- [ ] Real-time call transcription display
- [ ] Custom scam pattern detection
- [ ] Support for Google Cloud Speech-to-Text
- [ ] Windows and Linux support

## Support

For issues or questions:
1. Check logs in DevTools (--dev mode)
2. Review System Preferences permissions
3. Verify API keys and credentials
4. Check backend is running and accessible

## License

© 2026 NexusGuard. All rights reserved.
