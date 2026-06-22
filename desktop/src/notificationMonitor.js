const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class NotificationMonitor {
  constructor() {
    this.isMonitoring = false;
    this.lastCheckedId = 0;
    this.monitoringProcess = null;
    this.stateFile = path.join(
      os.homedir(),
      '.nexusguard/notification_state.json'
    );

    this.loadState();
  }

  loadState() {
    try {
      if (fs.existsSync(this.stateFile)) {
        const data = JSON.parse(fs.readFileSync(this.stateFile, 'utf8'));
        this.lastCheckedId = data.lastCheckedId || 0;
      }
    } catch (error) {
      console.warn('Failed to load notification state:', error.message);
    }
  }

  saveState() {
    try {
      const dir = path.dirname(this.stateFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.stateFile, JSON.stringify({
        lastCheckedId: this.lastCheckedId,
        lastChecked: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Failed to save notification state:', error.message);
    }
  }

  startMonitoring(onNewMessage) {
    if (this.isMonitoring) {
      console.warn('Notification monitoring already running');
      return;
    }

    console.log('🔔 Starting macOS Messages monitoring...');
    this.isMonitoring = true;

    // Use AppleScript to monitor for new messages in the Messages app
    // Check every 3 seconds for new messages
    this.monitoringInterval = setInterval(() => {
      try {
        this.checkForNewMessages(onNewMessage);
      } catch (error) {
        console.error('Error checking for new messages:', error.message);
      }
    }, 3000);

    // Also do an initial check
    this.checkForNewMessages(onNewMessage);
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('🔔 Stopped Messages monitoring');
  }

  checkForNewMessages(onNewMessage) {
    try {
      // Use AppleScript to get recent messages from Messages app
      const script = `tell application "Messages"
  return "active"
end tell`;

      const scriptFile = path.join(os.homedir(), '.nexusguard/get_messages.scpt');
      fs.writeFileSync(scriptFile, script);

      try {
        const result = execSync(`osascript "${scriptFile}"`, {
          encoding: 'utf8',
          timeout: 3000,
        });

        // Clean up
        try {
          fs.unlinkSync(scriptFile);
        } catch (e) {}

        // Parse results and detect new messages
        if (result.trim()) {
          console.log('🔔 Messages app is active with chats');
        }

        // Alternative: check the modification time of the Messages database
        // If it was modified recently, there might be new messages
        this.checkDatabaseModificationTime(onNewMessage);
      } catch (error) {
        // Clean up on error
        try {
          fs.unlinkSync(scriptFile);
        } catch (e) {}
      }
    } catch (error) {
      // Silently fail
    }
  }

  checkDatabaseModificationTime(onNewMessage) {
    try {
      const dbPath = path.join(
        os.homedir(),
        'Library/Messages/chat.db'
      );

      if (!fs.existsSync(dbPath)) {
        return;
      }

      const stat = fs.statSync(dbPath);
      const modTime = stat.mtimeMs;

      // If database was modified in the last 5 seconds, try to read it
      if (modTime > Date.now() - 5000) {
        console.log('🔔 Messages database was recently modified, attempting to read...');
        this.tryReadMessagesDatabase(onNewMessage);
      }
    } catch (error) {
      // Silently fail
    }
  }

  tryReadMessagesDatabase(onNewMessage) {
    try {
      const dbPath = path.join(
        os.homedir(),
        'Library/Messages/chat.db'
      );

      // Try to read using system sqlite3 with a timeout
      try {
        const query = `SELECT ROWID as id, text, handle_id, date, is_from_me FROM message WHERE ROWID > ${this.lastCheckedId} AND text IS NOT NULL AND text != '' ORDER BY ROWID ASC LIMIT 10`;

        const result = execSync(`sqlite3 "${dbPath}" "${query}"`, {
          encoding: 'utf8',
          timeout: 2000,
          stdio: ['pipe', 'pipe', 'ignore'],
        });

        if (result.trim()) {
          console.log('🔔 Found new messages via database query');
          this.processMessages(result, onNewMessage);
        }
      } catch (error) {
        // Database access may still fail - that's ok, we'll rely on test messages
        if (!error.message.includes('EPERM') && !error.message.includes('authorization')) {
          console.log('💡 Note: Real-time iMessage monitoring requires additional macOS permissions');
        }
      }
    } catch (error) {
      // Silently fail
    }
  }

  processMessages(output, onNewMessage) {
    try {
      const lines = output.trim().split('\n');
      const messages = [];

      lines.forEach(line => {
        if (line.trim()) {
          const parts = line.split('|');
          if (parts.length >= 5) {
            const id = parseInt(parts[0]);
            const text = parts[1];
            const handleId = parseInt(parts[2]);
            const date = parseInt(parts[3]);
            const isFromMe = parseInt(parts[4]);

            if (!isFromMe && text) {
              this.lastCheckedId = Math.max(this.lastCheckedId, id);
              messages.push({
                id,
                text,
                sender: `Contact-${handleId}`,
                isFromMe: false,
                timestamp: new Date(date * 1000),
              });
            }
          }
        }
      });

      if (messages.length > 0) {
        this.saveState();
        onNewMessage(messages);
      }
    } catch (error) {
      console.error('Error processing messages:', error.message);
    }
  }

  isMonitoringActive() {
    return this.isMonitoring;
  }
}

module.exports = NotificationMonitor;
