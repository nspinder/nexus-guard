const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

class IMessageMonitor {
  constructor() {
    this.isMonitoring = false;
    this.lastSeenMessageId = 0;
    this.monitoringInterval = null;
    this.stateFile = path.join(
      os.homedir(),
      '.nexusguard/imessage_state.json'
    );

    // Create state directory if it doesn't exist
    const stateDir = path.dirname(this.stateFile);
    if (!fs.existsSync(stateDir)) {
      fs.mkdirSync(stateDir, { recursive: true });
    }

    this.loadState();
  }

  loadState() {
    try {
      if (fs.existsSync(this.stateFile)) {
        const data = JSON.parse(fs.readFileSync(this.stateFile, 'utf8'));
        this.lastSeenMessageId = data.lastSeenMessageId || 0;
      }
    } catch (error) {
      console.warn('Failed to load iMessage state:', error.message);
      this.lastSeenMessageId = 0;
    }
  }

  saveState() {
    try {
      fs.writeFileSync(this.stateFile, JSON.stringify({
        lastSeenMessageId: this.lastSeenMessageId,
        lastChecked: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Failed to save iMessage state:', error.message);
    }
  }

  getNewMessages() {
    try {
      // Use AppleScript to query Messages app directly via temp file
      const scriptContent = `
tell application "Messages"
  set output to ""
  repeat with aChat in chats
    try
      repeat with aMessage in messages in aChat
        try
          set msgText to text of aMessage
          set msgSender to sender of aMessage
          set output to output & msgText & "|" & msgSender & linefeed
        end try
      end repeat
    end try
  end repeat
  return output
end tell
`;

      const tempScriptPath = path.join(os.homedir(), '.nexusguard/query_messages.scpt');
      const tempScriptDir = path.dirname(tempScriptPath);

      if (!fs.existsSync(tempScriptDir)) {
        fs.mkdirSync(tempScriptDir, { recursive: true });
      }

      try {
        // Write script to temp file
        fs.writeFileSync(tempScriptPath, scriptContent);

        // Execute the script
        try {
          const result = execSync(`osascript "${tempScriptPath}" 2>&1`, {
            encoding: 'utf8',
            timeout: 5000,
            maxBuffer: 10 * 1024 * 1024,
          });

          // Clean up
          try {
            fs.unlinkSync(tempScriptPath);
          } catch (e) {
            // Ignore
          }

          if (result.trim()) {
            console.log(`📨 AppleScript returned: "${result.trim().substring(0, 100)}..."`);
          }

          const messages = [];
          const lines = result.trim().split('\n').filter(l => l && !l.includes('error'));

          lines.forEach(line => {
            if (line.trim() && !line.includes('error')) {
              const parts = line.split('|');
              if (parts.length >= 2) {
                const text = parts[0];
                const sender = parts[1];
                if (text && text.trim()) {
                  messages.push({
                    id: Math.random(),
                    text: text.trim(),
                    sender: sender ? sender.trim() : 'Unknown',
                    isFromMe: false,
                    timestamp: new Date(),
                  });
                }
              }
            }
          });

          if (messages.length > 0) {
            console.log(`📨 Found ${messages.length} message(s) via AppleScript`);
            return messages;
          }

          return [];
        } catch (error) {
          const errorMsg = error.stderr?.toString() || error.message || '';
          if (errorMsg.includes('1700') || errorMsg.includes('execution error')) {
            console.log(`📨 AppleScript syntax issue - checking syntax...`);
          } else if (errorMsg) {
            console.log(`📨 iMessage monitoring: ${errorMsg.split('\n')[0].substring(0, 80)}`);
          }

          // Clean up on error
          try {
            fs.unlinkSync(tempScriptPath);
          } catch (e) {
            // Ignore
          }
          return [];
        }
      } catch (error) {
        console.error('Error setting up iMessage monitoring:', error.message);
        return [];
      }
    } catch (error) {
      console.error('Error in iMessage monitoring:', error.message);
      return [];
    }
  }

  convertMacTimestamp(macTime) {
    // macOS uses seconds since 2001-01-01
    const macEpoch = new Date('2001-01-01').getTime();
    return new Date(macEpoch + macTime * 1000);
  }

  startMonitoring(onNewMessages) {
    if (this.isMonitoring) {
      console.warn('iMessage monitoring already running');
      return;
    }

    console.log('📱 Starting iMessage monitoring...');
    this.isMonitoring = true;
    let checkCount = 0;

    // Check for new messages every 5 seconds
    console.log('📨 Setting up monitoring interval...');
    this.monitoringInterval = setInterval(() => {
      checkCount++;
      console.log(`📨 iMessage check cycle #${checkCount} starting...`);

      try {
        console.log(`📨 Calling getNewMessages...`);
        const newMessages = this.getNewMessages();
        console.log(`📨 getNewMessages returned ${newMessages.length} messages`);

        if (newMessages.length > 0) {
          console.log(`📨 Found ${newMessages.length} new iMessage(s)`);
          this.lastSeenMessageId = newMessages[newMessages.length - 1].id;
          this.saveState();
          console.log(`📨 Calling callback with ${newMessages.length} messages`);
          onNewMessages(newMessages);
        }
      } catch (error) {
        console.error('Error monitoring iMessages:', error.message, error.stack);
      }
    }, 5000); // Check every 5 seconds
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('📱 Stopped iMessage monitoring');
  }

  isMonitoringActive() {
    return this.isMonitoring;
  }
}

module.exports = IMessageMonitor;
