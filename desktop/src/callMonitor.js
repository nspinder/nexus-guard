const { spawn } = require('child_process');
const EventEmitter = require('events');

class CallMonitor extends EventEmitter {
  constructor() {
    super();
    this.isMonitoring = false;
    this.activeCall = null;
    this.checkInterval = null;
    this.previousState = null;
  }

  startMonitoring() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    console.log('📱 Starting call monitoring (WhatsApp + FaceTime)...');

    // Check for active calls every 2 seconds
    this.checkInterval = setInterval(() => {
      this.checkForActiveCalls();
    }, 2000);

    // Initial check
    this.checkForActiveCalls();
  }

  stopMonitoring() {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    if (this.activeCall) {
      this.emit('call-ended', this.activeCall);
      this.activeCall = null;
    }

    console.log('📱 Stopped call monitoring');
  }

  checkForActiveCalls() {
    // Check for both WhatsApp and FaceTime calls
    Promise.all([
      this.checkWhatsAppCall(),
      this.checkFaceTimeCall(),
    ])
      .then(([whatsappCall, facetimeCall]) => {
        const callInfo = whatsappCall || facetimeCall;

        if (callInfo && !this.activeCall) {
          // Call started
          this.activeCall = callInfo;
          console.log(`📞 Call detected: ${callInfo.platform} from ${callInfo.callerId}`);
          this.emit('call-started', callInfo);
        } else if (!callInfo && this.activeCall) {
          // Call ended
          console.log(`📞 Call ended: ${this.activeCall.platform}`);
          this.emit('call-ended', this.activeCall);
          this.activeCall = null;
        }
      })
      .catch((error) => {
        console.error('Error checking for active calls:', error.message);
      });
  }

  checkWhatsAppCall() {
    return new Promise((resolve) => {
      try {
        // Check if WhatsApp is running
        const pgrep = spawn('pgrep', ['-i', 'whatsapp']);
        let isWhatsAppRunning = false;

        pgrep.on('close', (code) => {
          if (code === 0) {
            // WhatsApp is running, check for active call
            this.detectWhatsAppCall().then((callInfo) => {
              resolve(callInfo);
            });
          } else {
            resolve(null);
          }
        });

        setTimeout(() => resolve(null), 2000);
      } catch (error) {
        console.error('Error checking WhatsApp:', error.message);
        resolve(null);
      }
    });
  }

  detectWhatsAppCall() {
    return new Promise((resolve) => {
      try {
        const osascript = spawn('osascript', [
          '-e',
          `try
            tell application "WhatsApp"
              return "active"
            end tell
          end try
          return "inactive"`,
        ]);

        let output = '';
        osascript.stdout.on('data', (data) => {
          output += data.toString().toLowerCase();
        });

        osascript.on('close', () => {
          if (output.includes('active')) {
            resolve({
              callerId: 'WhatsApp Contact',
              startTime: new Date(),
              platform: 'whatsapp',
            });
          } else {
            resolve(null);
          }
        });

        setTimeout(() => resolve(null), 1500);
      } catch (error) {
        resolve(null);
      }
    });
  }

  checkFaceTimeCall() {
    return new Promise((resolve) => {
      try {
        // Check if FaceTime is running and has active call
        const osascript = spawn('osascript', [
          '-e',
          `try
            tell application "FaceTime"
              set callCount to count of windows
              if callCount > 0 then
                return "active"
              else
                return "inactive"
              end if
            end tell
          end try
          return "inactive"`,
        ]);

        let output = '';
        osascript.stdout.on('data', (data) => {
          output += data.toString().toLowerCase();
        });

        osascript.on('close', () => {
          if (output.includes('active')) {
            // Try to get FaceTime caller info
            this.getFaceTimeCaller().then((caller) => {
              resolve({
                callerId: caller || 'FaceTime Caller',
                startTime: new Date(),
                platform: 'facetime',
              });
            });
          } else {
            resolve(null);
          }
        });

        setTimeout(() => resolve(null), 1500);
      } catch (error) {
        resolve(null);
      }
    });
  }

  getFaceTimeCaller() {
    return new Promise((resolve) => {
      try {
        const osascript = spawn('osascript', [
          '-e',
          `try
            tell application "FaceTime"
              if (count of windows) > 0 then
                set callerName to name of window 1
                return callerName
              end if
            end tell
          end try
          return "Unknown"`,
        ]);

        let output = '';
        osascript.stdout.on('data', (data) => {
          output += data.toString().trim();
        });

        osascript.on('close', () => {
          resolve(output || 'Unknown');
        });

        setTimeout(() => resolve('Unknown'), 1000);
      } catch (error) {
        resolve('Unknown');
      }
    });
  }

  isCallActive() {
    return this.activeCall !== null;
  }
}

module.exports = CallMonitor;
