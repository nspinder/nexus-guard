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
});
