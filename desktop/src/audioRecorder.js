const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class AudioRecorder {
  constructor() {
    this.isRecording = false;
    this.recordingProcess = null;
    this.currentRecordingPath = null;
    this.recordingsDir = path.join(os.homedir(), '.nexusguard', 'recordings');
    this.audioDeviceIndex = 1; // MacBook Air Microphone - most reliable for call recording
    this.audioStream = null; // For streaming to live analyzer

    // Create recordings directory if it doesn't exist
    if (!fs.existsSync(this.recordingsDir)) {
      fs.mkdirSync(this.recordingsDir, { recursive: true });
    }

    console.log('✓ Using MacBook Air Microphone (device 1) for call recording');
  }

  startRecording(callInfo = {}) {
    if (this.isRecording) {
      console.warn('Already recording');
      return null;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const platform = callInfo.platform || 'unknown';
    const callerId = (callInfo.callerId || 'unknown').replace(/[^a-zA-Z0-9]/g, '');

    const filename = `${platform}_${callerId}_${timestamp}.wav`;
    const base = path.resolve(this.recordingsDir);
    const target = path.resolve(base, filename);
    const relative = path.relative(base, target);
    
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      console.error('Invalid recording path');
      return null;
    }
    
    this.currentRecordingPath = target;

    console.log(`🎤 Starting audio recording (${platform}):`, this.currentRecordingPath);

    try {
      // Record audio from microphone as WAV (simple, universally supported format)
      this.recordingProcess = spawn('ffmpeg', [
        '-f', 'avfoundation',
        '-i', `:${this.audioDeviceIndex}`, // Audio-only from device
        '-t', '3600', // Max 1 hour
        '-y', // Overwrite output file
        this.currentRecordingPath,
      ]);

      let hasStarted = false;

      this.recordingProcess.stderr.on('data', (data) => {
        const output = data.toString();

        if (output.includes('error') || output.includes('Error')) {
          if (!hasStarted) {
            console.error('[ffmpeg error]', output);
          }
        }

        if (output.includes('frame=') || output.includes('time=')) {
          hasStarted = true;
          if (!this.isRecording) {
            console.log('✓ Recording started successfully');
          }
        }
      });

      this.recordingProcess.on('error', (error) => {
        console.error('Recording process error:', error);
        this.isRecording = false;
      });

      this.isRecording = true;

      // Return a mock stream object for compatibility with live analyzer
      // In production, you'd want to pipe audio to Deepgram separately
      return {
        on: () => {}, // Mock stream
        pipe: () => {}, // Mock pipe
      };
    } catch (error) {
      console.error('Failed to start recording:', error);
      console.log('Make sure ffmpeg is installed: brew install ffmpeg');
      this.currentRecordingPath = null;
      return null;
    }
  }

  stopRecording() {
    if (!this.isRecording) {
      console.warn('Not recording');
      return null;
    }

    console.log('🎤 Stopping audio recording');

    if (this.recordingProcess) {
      // Send SIGINT to gracefully stop ffmpeg
      this.recordingProcess.kill('SIGINT');
      this.recordingProcess = null;
    }

    this.isRecording = false;

    // Give ffmpeg a moment to finish writing the file
    return new Promise((resolve) => {
      setTimeout(() => {
        if (this.currentRecordingPath && fs.existsSync(this.currentRecordingPath)) {
          const stats = fs.statSync(this.currentRecordingPath);

          // Check if file has content
          if (stats.size > 1000) {
            // File has content
            const recordingPath = this.currentRecordingPath;
            this.currentRecordingPath = null;
            console.log('✓ Recording saved:', recordingPath, `(${Math.round(stats.size / 1024)}KB)`);
            resolve(recordingPath);
          } else {
            console.warn('Recording file too small - may not have captured audio');
            console.log('💡 Make sure microphone/audio input is available');
            resolve(null);
          }
        } else {
          console.warn('Recording file not found');
          resolve(null);
        }
      }, 1000);
    });
  }

  isRecordingActive() {
    return this.isRecording;
  }

  getRecordingsDir() {
    return this.recordingsDir;
  }

  // Clean up old recordings (older than 7 days)
  cleanupOldRecordings() {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    try {
      fs.readdirSync(this.recordingsDir).forEach((file) => {
        const base = path.resolve(this.recordingsDir);
        const target = path.resolve(base, file);
        const relative = path.relative(base, target);
        if (relative.startsWith('..') || path.isAbsolute(relative)) {
          return;
        }
        const filePath = target;
        const stats = fs.statSync(filePath);

        if (stats.mtimeMs < sevenDaysAgo) {
          fs.unlinkSync(filePath);
          console.log('🗑 Deleted old recording:', file);
        }
      });
    } catch (error) {
      console.error('Error cleaning up recordings:', error);
    }
  }
}

module.exports = AudioRecorder;
