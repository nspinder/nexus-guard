const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class PermissionManager {
  constructor() {
    this.permissionsFile = path.join(
      os.homedir(),
      '.nexusguard/permissions_state.json'
    );
    this.loadState();
  }

  loadState() {
    try {
      if (fs.existsSync(this.permissionsFile)) {
        const data = JSON.parse(fs.readFileSync(this.permissionsFile, 'utf8'));
        this.permissions = data;
      } else {
        this.permissions = {
          microphone: false,
          screenRecording: false,
          accessibility: false,
          fullDiskAccess: false,
          setupWizardCompleted: false,
        };
        this.saveState();
      }
    } catch (error) {
      console.error('Failed to load permission state:', error.message);
      this.permissions = {
        microphone: false,
        screenRecording: false,
        accessibility: false,
        fullDiskAccess: false,
        setupWizardCompleted: false,
      };
    }
  }

  saveState() {
    try {
      const dir = path.dirname(this.permissionsFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(
        this.permissionsFile,
        JSON.stringify(this.permissions, null, 2)
      );
    } catch (error) {
      console.error('Failed to save permission state:', error.message);
    }
  }

  getPermissionsStatus() {
    return {
      ...this.permissions,
      canDetectMicrophone: this.checkMicrophoneAvailable(),
    };
  }

  checkMicrophoneAvailable() {
    try {
      const result = execSync('system_profiler SPAudioDataType 2>/dev/null', {
        encoding: 'utf8',
      });
      return result.includes('Microphone') || result.includes('Input');
    } catch {
      return true; // Assume available if we can't check
    }
  }

  openMicrophoneSettings() {
    this.openSystemPreferences('Microphone');
  }

  openScreenRecordingSettings() {
    this.openSystemPreferences('ScreenRecording');
  }

  openAccessibilitySettings() {
    this.openSystemPreferences('Accessibility');
  }

  openFullDiskAccessSettings() {
    this.openSystemPreferences('Security');
  }

  openSystemPreferences(pane) {
    try {
      const paneMap = {
        Microphone: 'com.apple.preference.sound',
        ScreenRecording: 'com.apple.preference.security?Privacy_ScreenCapture',
        Accessibility: 'com.apple.preference.universalaccess',
        Security: 'com.apple.preference.security',
      };

      const paneId = paneMap[pane] || 'com.apple.preference.security';

      // Use osascript to open System Preferences
      spawn('osascript', [
        '-e',
        `open location "x-apple.systempreferences:com.apple.preference.security"`,
      ]);

      // Fallback: Use open command
      setTimeout(() => {
        try {
          execSync(`open "x-apple.systempreferences:${paneId}"`);
        } catch {
          execSync('open "x-apple.systempreferences:"');
        }
      }, 500);
    } catch (error) {
      console.error('Failed to open System Preferences:', error.message);
    }
  }

  markPermissionGranted(permission) {
    if (this.permissions.hasOwnProperty(permission)) {
      this.permissions[permission] = true;
      this.saveState();
    }
  }

  markSetupWizardCompleted() {
    this.permissions.setupWizardCompleted = true;
    this.saveState();
  }

  resetSetupWizard() {
    this.permissions.setupWizardCompleted = false;
    this.saveState();
  }

  getSetupInstructions(permission) {
    const instructions = {
      microphone: {
        title: '🎤 Microphone Access',
        steps: [
          'Click "Open System Preferences" below',
          'Click the lock icon to unlock settings (enter password)',
          'Find "Electron" or "NexusGuard" in the list',
          'Check the checkbox next to it',
          'Close System Preferences and return to NexusGuard',
          'Click "Verified" to confirm',
        ],
        description:
          'NexusGuard needs microphone access to record call audio for analysis.',
      },
      screenRecording: {
        title: '📹 Screen Recording',
        steps: [
          'Click "Open System Preferences" below',
          'Click the lock icon to unlock settings (enter password)',
          'Find "Electron" in the list under "Screen Recording"',
          'Check the checkbox next to it',
          'Close System Preferences and return to NexusGuard',
          'Click "Verified" to confirm',
        ],
        description:
          'NexusGuard needs screen recording access to detect active calls.',
      },
      accessibility: {
        title: '♿ Accessibility',
        steps: [
          'Click "Open System Preferences" below',
          'Click the lock icon to unlock settings (enter password)',
          'Find "Electron" in the list under "Accessibility"',
          'Check the checkbox next to it',
          'Close System Preferences and return to NexusGuard',
          'Click "Verified" to confirm',
        ],
        description:
          'NexusGuard needs accessibility access to interact with WhatsApp and FaceTime.',
      },
      fullDiskAccess: {
        title: '💾 Full Disk Access',
        steps: [
          'Click "Open System Preferences" below',
          'Click the lock icon to unlock settings (enter password)',
          'Find "Electron" in the list under "Full Disk Access"',
          'If not present, click "+" and select the Electron app',
          'Check the checkbox next to it',
          'Close System Preferences and return to NexusGuard',
          'Click "Verified" to confirm',
        ],
        description:
          'NexusGuard needs full disk access to read iMessages from the Messages database.',
      },
    };

    return instructions[permission] || null;
  }

  getAllPermissionsGranted() {
    return (
      this.permissions.microphone &&
      this.permissions.screenRecording &&
      this.permissions.accessibility &&
      this.permissions.fullDiskAccess
    );
  }
}

module.exports = PermissionManager;
