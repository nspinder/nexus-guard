let isMonitoring = false;
const toggleBtn = document.getElementById('toggleBtn');
const statusText = document.getElementById('statusText');
const statusIndicator = document.querySelector('.status-indicator');

toggleBtn.addEventListener('click', async () => {
  if (!isMonitoring) {
    startMonitoring();
  } else {
    stopMonitoring();
  }
});

async function startMonitoring() {
  console.log('Starting monitoring...');
  window.electronAPI.startMonitoring();
  isMonitoring = true;
  updateUI();
}

function stopMonitoring() {
  console.log('Stopping monitoring...');
  window.electronAPI.stopMonitoring();
  isMonitoring = false;
  updateUI();
}

function updateUI() {
  if (isMonitoring) {
    toggleBtn.textContent = 'Stop Monitoring';
    toggleBtn.classList.add('active');
    statusText.textContent = 'Monitoring Active';
    statusIndicator.classList.add('active');
  } else {
    toggleBtn.textContent = 'Start Monitoring';
    toggleBtn.classList.remove('active');
    statusText.textContent = 'Inactive';
    statusIndicator.classList.remove('active');
    document.getElementById('callInfo').style.display = 'none';
  }
}

// Listen for call status updates
window.electronAPI.onCallStatus((data) => {
  console.log('Call status update:', data);
  const callInfo = document.getElementById('callInfo');

  if (data.status === 'active') {
    callInfo.style.display = 'block';
    const platform = data.callInfo?.platform || 'unknown';
    const platformEmoji = platform === 'facetime' ? '📱' : '💬';
    const platformName = platform === 'facetime' ? 'FaceTime' : 'WhatsApp';

    document.getElementById('callerName').textContent =
      `${platformEmoji} ${data.callInfo?.callerId || 'Unknown'} (${platformName})`;
    document.getElementById('callStatus').textContent = 'Active';

    // Start call duration timer
    let duration = 0;
    const durationInterval = setInterval(() => {
      duration++;
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      document.getElementById('callDuration').textContent =
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);

    // Store interval ID to clear it later
    callInfo.dataset.durationInterval = durationInterval;
  } else if (data.status === 'ended') {
    if (callInfo.dataset.durationInterval) {
      clearInterval(parseInt(callInfo.dataset.durationInterval));
    }
    document.getElementById('callStatus').textContent = 'Ended';
  }
});

// Listen for monitoring status updates
window.electronAPI.onMonitoringStatus((data) => {
  isMonitoring = data.active;
  updateUI();
});

// Listen for analysis progress
window.electronAPI.onAnalyzing((data) => {
  document.getElementById('analysisSection').style.display = 'block';
  document.getElementById('analysisMessage').textContent = data.message;
  document.getElementById('analysisResult').style.display = 'none';
});

// Listen for live transcript updates
window.electronAPI.onLiveTranscript?.((data) => {
  const transcriptEl = document.getElementById('transcriptText');
  transcriptEl.style.display = 'block';
  document.getElementById('liveTranscript').style.display = 'block';

  if (data.isFinal) {
    transcriptEl.textContent = data.text;
  } else {
    transcriptEl.innerHTML = `<p>${data.text}</p><p style="color: #64748b; font-style: italic;">(listening...)</p>`;
  }

  // Auto-scroll to bottom
  transcriptEl.parentElement.scrollTop = transcriptEl.parentElement.scrollHeight;
});

// Listen for live alerts during call
window.electronAPI.onLiveAlert?.((alert) => {
  console.log('Live alert received:', alert);

  const liveAlertBox = document.getElementById('liveAlertBox');
  liveAlertBox.style.display = 'block';

  const alertContent = document.getElementById('liveAlertContent');
  alertContent.innerHTML = `
    <p><strong>Probability:</strong> <span style="color: #ef4444; font-weight: bold;">${Math.round(alert.probability)}%</span></p>
    <p><strong>Risk Level:</strong> <span style="color: #ef4444; font-weight: bold;">${alert.risk.toUpperCase()}</span></p>
    <p><strong>Reasoning:</strong> ${alert.reasoning}</p>
    ${alert.flags && alert.flags.length > 0 ? `
      <p><strong>Red Flags:</strong></p>
      <ul style="margin: 8px 0 0 20px; color: #fca5a5;">
        ${alert.flags.map(f => `<li>${f}</li>`).join('')}
      </ul>
    ` : ''}
    <p style="margin-top: 12px; color: #cbd5e1; font-size: 11px;">⚠️ It's safe to end this call now.</p>
  `;

  // Play system sound alert
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = 800;
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
});

// Handle hang up button
document.getElementById('hangUpBtn')?.addEventListener('click', () => {
  // Note: We can't actually hang up the call from extension,
  // but we can alert the user and suggest they end it
  alert('Please end the call manually. The potential scam has been detected and recorded.');
});

// Listen for analysis complete
window.electronAPI.onAnalysisComplete((data) => {
  console.log('Analysis complete:', data);
  document.getElementById('analysisSection').style.display = 'none';
  document.getElementById('liveTranscript').style.display = 'none';
  document.getElementById('liveAlertBox').style.display = 'none';

  if (data.success) {
    const result = document.getElementById('analysisResult');
    const analysis = data.analysis;

    // Update probability
    const probabilityEl = document.getElementById('probability');
    probabilityEl.textContent = Math.round(analysis.probability);
    probabilityEl.className = 'probability-value';
    if (analysis.probability > 70) {
      probabilityEl.classList.add('high');
    } else if (analysis.probability > 40) {
      probabilityEl.classList.add('medium');
    } else {
      probabilityEl.classList.add('low');
    }

    // Update risk level
    const riskEl = document.getElementById('riskLevel');
    riskEl.textContent = analysis.risk.toUpperCase();
    riskEl.className = 'risk-value ' + analysis.risk;

    // Update flags
    const flagsContainer = document.getElementById('flags');
    flagsContainer.innerHTML = '';
    if (analysis.flags && analysis.flags.length > 0) {
      analysis.flags.forEach((flag) => {
        const flagEl = document.createElement('div');
        flagEl.className = 'flag-item';
        flagEl.textContent = '⚠️ ' + flag;
        flagsContainer.appendChild(flagEl);
      });
    } else {
      const noFlagsEl = document.createElement('div');
      noFlagsEl.className = 'flag-item';
      noFlagsEl.style.borderLeftColor = '#22c55e';
      noFlagsEl.style.background = 'rgba(34, 197, 94, 0.1)';
      noFlagsEl.style.color = '#86efac';
      noFlagsEl.textContent = '✓ No red flags detected';
      flagsContainer.appendChild(noFlagsEl);
    }

    result.style.display = 'block';
  } else {
    alert('Analysis failed: ' + data.error);
  }
});

function openSettings() {
  alert('Settings window coming soon!\n\nConfigure:\n- Deepgram API Key\n- Backend URL\n- User Credentials');
}

function testIMessage() {
  document.getElementById('testIMessageModal').style.display = 'flex';
}

function closeTestModal() {
  document.getElementById('testIMessageModal').style.display = 'none';
}

function submitTestIMessage() {
  const sender = document.getElementById('testSender').value.trim();
  const message = document.getElementById('testMessage').value.trim();

  if (!sender || !message) {
    alert('Please fill in both sender and message fields.');
    return;
  }

  window.electronAPI.sendTestIMessage({ sender, message });
  closeTestModal();
  alert('Test iMessage sent for analysis! Check the web dashboard.');
}

// Check initial status
window.electronAPI.getMonitoringStatus().then((status) => {
  isMonitoring = status;
  updateUI();
});
