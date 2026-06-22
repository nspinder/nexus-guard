const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  startMonitoring: () => ipcRenderer.send('start-monitoring'),
  stopMonitoring: () => ipcRenderer.send('stop-monitoring'),
  getMonitoringStatus: () => ipcRenderer.invoke('get-monitoring-status'),
  sendTestIMessage: (data) => ipcRenderer.send('test-imessage', data),
  onCallStatus: (callback) => ipcRenderer.on('call-status', (_, data) => callback(data)),
  onMonitoringStatus: (callback) => ipcRenderer.on('monitoring-status', (_, data) => callback(data)),
  onAnalyzing: (callback) => ipcRenderer.on('analyzing', (_, data) => callback(data)),
  onAnalysisComplete: (callback) => ipcRenderer.on('analysis-complete', (_, data) => callback(data)),
  onLiveTranscript: (callback) => ipcRenderer.on('live-transcript', (_, data) => callback(data)),
  onLiveAlert: (callback) => ipcRenderer.on('live-alert', (_, data) => callback(data)),

  // Permission and Setup Wizard API
  getPermissionsStatus: () => ipcRenderer.invoke('get-permissions-status'),
  openPermissionSettings: (permission) => ipcRenderer.send('open-permission-settings', permission),
  markPermissionGranted: (permission) => ipcRenderer.send('mark-permission-granted', permission),
  markSetupWizardCompleted: () => ipcRenderer.send('mark-setup-wizard-completed'),
  resetSetupWizard: () => ipcRenderer.send('reset-setup-wizard'),
  getSetupInstructions: (permission) => ipcRenderer.invoke('get-setup-instructions', permission),
  onPermissionsStatus: (callback) => ipcRenderer.on('permissions-status', (_, data) => callback(data)),
  onIMessageAlert: (callback) => ipcRenderer.on('imessage-alert', (_, data) => callback(data)),
});
