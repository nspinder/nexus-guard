const WebSocket = require('ws');
const axios = require('axios');

class LiveAnalyzer {
  constructor(deepgramApiKey, backendUrl) {
    this.deepgramApiKey = deepgramApiKey;
    this.backendUrl = backendUrl;
    this.ws = null;
    this.isConnected = false;
    this.fullTranscript = '';
    this.lastAlertScore = 0;
    this.analysisInterval = null;
  }

  startLiveTranscription(audioStream, callInfo, onTranscript, onAlert) {
    return new Promise((resolve, reject) => {
      try {
        // Skip live transcription if audio stream is a mock
        if (!audioStream || !audioStream.on || typeof audioStream.on !== 'function') {
          console.log('ℹ Live transcription not available - will analyze after call');
          resolve();
          return;
        }

        // Connect to Deepgram Live API
        const deepgramUrl = `wss://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&interim_results=true`;

        this.ws = new WebSocket(deepgramUrl, {
          headers: {
            Authorization: `Token ${this.deepgramApiKey}`,
          },
        });

        this.ws.on('open', () => {
          console.log('✓ Connected to Deepgram Live API');
          this.isConnected = true;
          resolve();

          // Pipe audio stream to Deepgram
          audioStream.on('data', (chunk) => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
              this.ws.send(chunk);
            }
          });

          audioStream.on('end', () => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
              this.ws.send(JSON.stringify({ type: 'CloseStream' }));
            }
          });
        });

        this.ws.on('message', (data) => {
          try {
            const message = JSON.parse(data);

            if (message.type === 'Results') {
              const transcript = message.channel.alternatives[0].transcript;

              if (transcript) {
                if (!message.is_final) {
                  // Interim result
                  console.log('[interim]', transcript);
                  onTranscript({
                    text: transcript,
                    isFinal: false,
                  });
                } else {
                  // Final result
                  this.fullTranscript += ' ' + transcript;
                  console.log('[final]', transcript);
                  onTranscript({
                    text: this.fullTranscript.trim(),
                    isFinal: true,
                  });

                  // Analyze for scams periodically (every 5 seconds or significant text)
                  if (this.fullTranscript.length > 100 && this.fullTranscript.length % 200 < 50) {
                    this.analyzePartialTranscript(
                      this.fullTranscript,
                      callInfo,
                      onAlert
                    );
                  }
                }
              }
            }
          } catch (error) {
            console.error('Error processing Deepgram message:', error);
          }
        });

        this.ws.on('error', (error) => {
          console.error('Deepgram WebSocket error:', error);
          this.isConnected = false;
          // Don't reject - allow recording to continue even if live transcription fails
          resolve();
        });

        this.ws.on('close', () => {
          console.log('Deepgram connection closed');
          this.isConnected = false;
        });
      } catch (error) {
        console.error('Failed to connect to Deepgram:', error);
        // Resolve instead of reject so recording continues
        resolve();
      }
    });
  }

  async analyzePartialTranscript(transcript, callInfo, onAlert) {
    try {
      if (transcript.length < 50) {
        // Not enough text to analyze yet
        return;
      }

      // Send to backend for analysis
      const response = await axios.post(
        `${this.backendUrl}/api/calls/analyze`,
        {
          callerId: callInfo.callerId,
          transcript,
          platform: callInfo.platform,
          isLive: true, // Indicate this is live analysis
        },
        {
          headers: {
            Authorization: `Bearer ${callInfo.authToken}`,
            'X-User-Id': callInfo.userId,
            'X-User-Email': callInfo.userEmail,
          },
          timeout: 10000,
        }
      );

      const analysis = response.data.analysis;

      // Alert if score is high enough and higher than last alert
      // Lower threshold (60%) for during-call alerts so user can act immediately
      if (analysis.probability > 60 && analysis.probability > this.lastAlertScore + 10) {
        this.lastAlertScore = analysis.probability;
        console.log('🚨 LIVE ALERT - Scam probability:', analysis.probability);

        onAlert({
          probability: analysis.probability,
          risk: analysis.risk,
          flags: analysis.flags,
          timestamp: new Date(),
          reasoning: analysis.reasoning,
        });
      }
    } catch (error) {
      console.error('Error analyzing partial transcript:', error.message);
    }
  }

  stopLiveTranscription() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.fullTranscript = '';
    this.lastAlertScore = 0;
  }

  getFullTranscript() {
    return this.fullTranscript.trim();
  }
}

module.exports = LiveAnalyzer;
