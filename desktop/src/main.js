const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');
const CallMonitor = require('./callMonitor');
const AudioRecorder = require('./audioRecorder');
const ScamAnalyzer = require('./scamAnalyzer');
const LiveAnalyzer = require('./liveAnalyzer');
const NotificationMonitor = require('./notificationMonitor');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

let mainWindow;
let callMonitor;
let audioRecorder;
let scamAnalyzer;
let liveAnalyzer;
let notificationMonitor;
let isMonitoring = false;
let currentCallInfo = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 500,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'ui', 'index.html'));

  // Open dev tools for debugging
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', () => {
  createWindow();

  // Initialize services
  callMonitor = new CallMonitor();
  audioRecorder = new AudioRecorder();
  scamAnalyzer = new ScamAnalyzer();
  liveAnalyzer = new LiveAnalyzer(
    process.env.STT_API_KEY,
    process.env.BACKEND_URL || 'http://localhost:3001'
  );
  notificationMonitor = new NotificationMonitor();

  // Listen for call state changes
  callMonitor.on('call-started', (callInfo) => {
    console.log('📞 Call started:', callInfo);
    currentCallInfo = callInfo;
    mainWindow?.webContents.send('call-status', { status: 'active', callInfo });

    // Start recording when call starts
    const audioStream = audioRecorder.startRecording(callInfo);

    // Start live transcription and analysis
    if (audioStream) {
      // Add auth info to call for API requests
      const callInfoWithAuth = {
        ...callInfo,
        authToken: process.env.AUTH_TOKEN,
        userId: process.env.USER_ID,
        userEmail: process.env.USER_EMAIL,
      };

      liveAnalyzer.startLiveTranscription(
        audioStream,
        callInfoWithAuth,
        (transcript) => {
          // Send transcript updates to UI
          mainWindow?.webContents.send('live-transcript', transcript);
        },
        (alert) => {
          // Send live alerts to UI
          console.log('🚨 LIVE SCAM ALERT:', alert.probability + '%');
          mainWindow?.webContents.send('live-alert', alert);
        }
      ).catch((error) => {
        console.error('Failed to start live transcription:', error);
        mainWindow?.webContents.send('analyzing', {
          message: 'Live transcription unavailable - will analyze after call',
        });
      });
    }
  });

  callMonitor.on('call-ended', async (callInfo) => {
    console.log('📞 Call ended:', callInfo);
    mainWindow?.webContents.send('call-status', { status: 'ended', callInfo });

    // Stop live transcription
    liveAnalyzer.stopLiveTranscription();

    // Stop recording and save file
    audioRecorder.stopRecording().then(async (audioPath) => {
      if (audioPath) {
        console.log('Final analysis of call...');
        mainWindow?.webContents.send('analyzing', { message: 'Finalizing call analysis...' });
        const analysis = await scamAnalyzer.analyzeCall(audioPath, callInfo);
        mainWindow?.webContents.send('analysis-complete', analysis);
      } else {
        mainWindow?.webContents.send('analysis-complete', {
          success: false,
          error: 'Failed to record audio',
        });
      }
    });

    currentCallInfo = null;
  });

  // Setup menu
  setupMenu();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC handlers
ipcMain.on('start-monitoring', () => {
  console.log('🔴 START MONITORING clicked');
  isMonitoring = true;
  callMonitor.startMonitoring();

  // Start message notification monitoring
  console.log('📨 Attempting to start message monitoring...');
  notificationMonitor.startMonitoring((newMessages) => {
    console.log('📨 New message detected:', newMessages.length, 'message(s)');
    newMessages.forEach((message) => {
      console.log(`📨 Message from ${message.sender}: ${message.text.substring(0, 50)}...`);

      // Send to backend for analysis
      axios
        .post(
          `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/imessage/analyze`,
          {
            sender: message.sender,
            messageText: message.text,
            iMessageId: `${message.id}`,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.AUTH_TOKEN}`,
              'X-User-Id': process.env.USER_ID,
              'X-User-Email': process.env.USER_EMAIL,
            },
          }
        )
        .then((response) => {
          const { analysis, shouldAlert } = response.data;
          console.log(`📊 iMessage analysis: ${analysis.probability}% scam probability (${analysis.risk})`);

          if (shouldAlert) {
            console.log('🚨 IMESSAGE ALERT');
            mainWindow?.webContents.send('imessage-alert', {
              sender: message.sender,
              probability: analysis.probability,
              risk: analysis.risk,
              color: analysis.color,
              timestamp: new Date(),
            });
          }
        })
        .catch((error) => {
          console.error('Failed to analyze iMessage:', error.message);
        });
    });
  });

  mainWindow?.webContents.send('monitoring-status', { active: true });
});

ipcMain.on('stop-monitoring', () => {
  isMonitoring = false;
  callMonitor.stopMonitoring();
  notificationMonitor.stopMonitoring();
  mainWindow?.webContents.send('monitoring-status', { active: false });
});

ipcMain.on('test-imessage', async (event, data) => {
  const { sender, message } = data;
  console.log(`📨 Test iMessage from ${sender}: ${message.substring(0, 50)}...`);

  // Send to backend for analysis
  try {
    const response = await axios.post(
      `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/imessage/analyze`,
      {
        sender: sender,
        messageText: message,
        iMessageId: `test_${Date.now()}`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.AUTH_TOKEN}`,
          'X-User-Id': process.env.USER_ID,
          'X-User-Email': process.env.USER_EMAIL,
        },
      }
    );

    const { analysis, shouldAlert } = response.data;
    console.log(`📊 Test iMessage analysis: ${analysis.probability}% scam probability (${analysis.risk})`);

    // Also scan URLs in the message
    try {
      const urlResponse = await axios.post(
        `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/url/extract-and-scan`,
        { text: message },
        {
          headers: {
            Authorization: `Bearer ${process.env.AUTH_TOKEN}`,
            'X-User-Id': process.env.USER_ID,
            'X-User-Email': process.env.USER_EMAIL,
          },
        }
      );

      if (urlResponse.data.results && urlResponse.data.results.length > 0) {
        console.log(`🔗 Found ${urlResponse.data.results.length} URL(s) in message`);
        if (urlResponse.data.hasMalicious) {
          console.log('🚨 MALICIOUS URL DETECTED');
        }
      }
    } catch (urlError) {
      console.error('URL scanning failed (non-critical):', urlError.message);
    }

    if (shouldAlert) {
      console.log('🚨 TEST IMESSAGE ALERT');
      mainWindow?.webContents.send('imessage-alert', {
        sender: sender,
        probability: analysis.probability,
        risk: analysis.risk,
        color: analysis.color,
        timestamp: new Date(),
      });
    }
  } catch (error) {
    console.error('Failed to analyze test iMessage:', error.message);
  }
});

ipcMain.handle('get-monitoring-status', () => {
  return isMonitoring;
});

function setupMenu() {
  const template = [
    {
      label: 'NexusGuard',
      submenu: [
        { label: 'About', role: 'about' },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'CmdOrCtrl+Y', role: 'redo' },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

console.log('🚀 NexusGuard Desktop App Started');
