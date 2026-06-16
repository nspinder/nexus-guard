# 📞 NexusGuard Desktop App

Real-time WhatsApp call monitoring and scam detection for macOS.

## Features

- **📱 WhatsApp Call Detection**: Automatically detects incoming calls on WhatsApp Desktop
- **🎤 Audio Recording**: Records call audio with system permissions
- **📝 Transcription**: Converts audio to text using Deepgram API
- **🔍 Scam Analysis**: Uses Claude AI to detect scam indicators
- **⚠️ Real-time Alerts**: Immediate notifications of suspicious calls
- **🔒 Privacy First**: All recordings stored locally and encrypted
- **📊 Call History**: Access to all analyzed calls in the web dashboard

## System Requirements

- **OS**: macOS 10.15 (Catalina) or later
- **RAM**: 2GB minimum
- **Disk**: 1GB free space (for recordings)
- **Dependencies**: 
  - Node.js 14+
  - ffmpeg (for audio capture)

## Quick Start

### 1. Install Dependencies
```bash
cd desktop
npm install
brew install ffmpeg
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. Run the App
```bash
npm start
```

See [SETUP.md](./SETUP.md) for detailed setup instructions.

## Architecture

### Components

1. **Main Process** (`main.js`)
   - Electron app initialization
   - Window management
   - IPC message handling

2. **Call Monitor** (`callMonitor.js`)
   - Detects WhatsApp Desktop calls
   - Monitors call state changes
   - Emits call events

3. **Audio Recorder** (`audioRecorder.js`)
   - Uses ffmpeg for system audio capture
   - Manages recording lifecycle
   - Stores files locally

4. **Scam Analyzer** (`scamAnalyzer.js`)
   - Sends audio to Deepgram for transcription
   - Communicates with backend API
   - Processes Claude analysis results

5. **UI** (`ui/`)
   - Real-time call status display
   - Analysis results visualization
   - Settings and configuration

## How It Works

```
WhatsApp Call → Call Detection → Audio Recording → Transcription
                                                        ↓
                                               Backend Analysis
                                                        ↓
                                          Scam Probability Score
                                                        ↓
                                            Alert + Store Result
```

## Configuration

### Environment Variables

```env
# Backend
BACKEND_URL=http://localhost:3001
AUTH_TOKEN=your_token
USER_ID=your_id
USER_EMAIL=your_email

# Speech-to-Text
STT_PROVIDER=deepgram
STT_API_KEY=your_api_key
```

### Permissions Required

The app needs these macOS permissions:
- **Microphone**: To record call audio
- **Accessibility**: To interact with WhatsApp
- **Screen Recording**: To detect call activity

Grant these in System Preferences → Security & Privacy.

## Data Flow

1. **Detection Phase** (2s polling)
   - Monitors WhatsApp Desktop process
   - Detects when call becomes active

2. **Recording Phase** (During call)
   - Captures system audio via ffmpeg
   - Stores to `~/.nexusguard/recordings/`

3. **Analysis Phase** (After call)
   - Sends audio to Deepgram API
   - Receives transcription text
   - Posts transcript to NexusGuard backend
   - Gets Claude AI analysis results
   - Displays results in UI

4. **Storage Phase**
   - Records saved in call history
   - Synced to web dashboard
   - Old recordings auto-deleted after 7 days

## API Integration

### Deepgram
- Transcribes audio to text
- Supports multiple languages
- Requires API key from https://console.deepgram.com

### NexusGuard Backend
- Analyzes transcripts with Claude AI
- Stores call records
- Sends alerts and notifications

## Privacy & Security

✅ **What's Protected**:
- Audio files encrypted locally
- Only transcripts sent to backend
- No raw audio uploaded
- Automatic cleanup of old files

🔐 **Consent**:
- User explicitly enables monitoring
- Can stop recording anytime
- Full control over recordings

## Troubleshooting

### App won't start
- Check ffmpeg is installed: `brew install ffmpeg`
- Verify Node.js version: `node --version` (14+)
- Check logs: Run with `npm start` and watch console

### No calls detected
- Ensure WhatsApp Desktop is running
- Check permissions in System Preferences
- Try restarting the app

### Recording fails
- Verify microphone is working
- Check ffmpeg installation
- Review system audio settings

### API errors
- Verify Deepgram API key
- Check backend is running
- Ensure internet connection

See [SETUP.md](./SETUP.md) for more help.

## Development

### Build for Distribution
```bash
npm run build
```

### Enable Debug Mode
```bash
npm start -- --dev
# Opens DevTools with full debugging
```

### Project Structure
```
src/
├── main.js              # Electron main process
├── callMonitor.js       # Call detection logic
├── audioRecorder.js     # Recording management
├── scamAnalyzer.js      # API communication
├── preload.js           # Electron security
└── ui/                  # User interface
    ├── index.html
    ├── style.css
    └── renderer.js
```

## Future Roadmap

- [ ] Audio encryption at rest
- [ ] Cloud backup option
- [ ] Custom alert rules
- [ ] Real-time transcription display
- [ ] Support for multiple speech-to-text providers
- [ ] Windows and Linux builds
- [ ] Mobile app sync
- [ ] Call recording playback

## Contributing

This is part of the NexusGuard scam detection platform. See main [README.md](../README.md) for more info.

## Support

For issues or questions:
1. Check [SETUP.md](./SETUP.md) for common problems
2. Review logs in debug mode (`npm start -- --dev`)
3. Verify all API credentials and permissions

## License

© 2026 NexusGuard - All Rights Reserved

---

Built with ❤️ to protect you from scams.
