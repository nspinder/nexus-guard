const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

class ScamAnalyzer {
  constructor() {
    this.backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    this.authToken = process.env.AUTH_TOKEN;
    this.userId = process.env.USER_ID;
    this.userEmail = process.env.USER_EMAIL;

    // You'll need a speech-to-text API key (e.g., Deepgram, Google Cloud Speech)
    this.speechToTextProvider = process.env.STT_PROVIDER || 'deepgram';
    this.sttApiKey = process.env.STT_API_KEY;
  }

  async analyzeCall(audioPath, callInfo) {
    try {
      console.log('🔍 Analyzing call from:', callInfo.callerId);

      // Check if audio file exists and has content
      const fs = require('fs');
      if (!fs.existsSync(audioPath)) {
        return {
          success: false,
          error: 'Audio file not found',
        };
      }

      const stats = fs.statSync(audioPath);
      console.log(`Audio file size: ${stats.size} bytes`);

      // If file is too small, skip transcription and use fallback
      if (stats.size < 10000) { // Less than 10KB
        console.warn('⚠️ Audio file too small - may not have captured call audio');
        return {
          success: false,
          error: 'Audio file too small - check microphone/audio routing. On macOS, you may need to set up BlackHole or an Aggregate Device for call recording.',
        };
      }

      // Step 1: Transcribe audio
      console.log('📝 Transcribing audio...');
      const transcript = await Promise.race([
        this.transcribeAudio(audioPath),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Transcription timeout')), 30000)
        ),
      ]);

      if (!transcript) {
        return {
          success: false,
          error: 'Failed to transcribe audio',
        };
      }

      console.log('✓ Transcription complete');

      // Step 2: Send to backend for analysis
      console.log('🔄 Sending to backend for analysis...');
      const analysis = await Promise.race([
        this.sendToBackend(transcript, callInfo),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Analysis timeout')), 15000)
        ),
      ]);

      return {
        success: true,
        transcript,
        analysis,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Error analyzing call:', error.message);
      return {
        success: false,
        error: error.message || 'Analysis failed',
      };
    }
  }

  async transcribeAudio(audioPath) {
    try {
      if (this.speechToTextProvider === 'deepgram') {
        return await this.transcribeWithDeepgram(audioPath);
      } else if (this.speechToTextProvider === 'google') {
        return await this.transcribeWithGoogle(audioPath);
      } else {
        console.warn('Unknown STT provider:', this.speechToTextProvider);
        return 'Failed to transcribe';
      }
    } catch (error) {
      console.error('Transcription error:', error);
      return null;
    }
  }

  async transcribeWithDeepgram(audioPath) {
    if (!this.sttApiKey) {
      console.error('Deepgram API key not configured');
      return null;
    }

    try {
      const audioBuffer = fs.readFileSync(audioPath);

      const response = await axios.post(
        'https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true',
        audioBuffer,
        {
          headers: {
            Authorization: `Token ${this.sttApiKey}`,
            'Content-Type': 'audio/wav',
          },
        }
      );

      if (response.data.results?.channels?.[0]?.alternatives?.[0]?.transcript) {
        return response.data.results.channels[0].alternatives[0].transcript;
      }

      return null;
    } catch (error) {
      console.error('Deepgram transcription error:', error);
      return null;
    }
  }

  async transcribeWithGoogle(audioPath) {
    // TODO: Implement Google Cloud Speech-to-Text
    console.warn('Google Cloud Speech-to-Text not yet implemented');
    return null;
  }

  async sendToBackend(transcript, callInfo) {
    try {
      const response = await axios.post(
        `${this.backendUrl}/api/calls/analyze`,
        {
          callerId: callInfo.callerId,
          transcript,
          platform: 'whatsapp',
          duration: callInfo.duration || 0,
          startTime: callInfo.startTime,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
            'X-User-Id': this.userId,
            'X-User-Email': this.userEmail,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.analysis;
    } catch (error) {
      console.error('Backend analysis error:', error);
      throw error;
    }
  }

  setCredentials(authToken, userId, userEmail) {
    this.authToken = authToken;
    this.userId = userId;
    this.userEmail = userEmail;
  }
}

module.exports = ScamAnalyzer;
