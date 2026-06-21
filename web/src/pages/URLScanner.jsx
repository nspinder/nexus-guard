import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/apiClient';
import { useURLScanning } from '../hooks/useURLScanning';
import URLScanResults from '../components/URLScanResults';
import '../styles/URLScanner.css';

export default function URLScanner() {
  const { authToken } = useAuth();
  const [urlInput, setUrlInput] = useState('');
  const [scanHistory, setScanHistory] = useState([]);
  const { scanning, urlResults, error, scanURLs, clearResults } = useURLScanning();

  // Load history from localStorage on mount
  React.useEffect(() => {
    const savedHistory = localStorage.getItem('urlScanHistory');
    if (savedHistory) {
      try {
        setScanHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to load scan history:', e);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  React.useEffect(() => {
    if (scanHistory.length > 0) {
      localStorage.setItem('urlScanHistory', JSON.stringify(scanHistory));
    }
  }, [scanHistory]);

  const handleScan = async (e) => {
    e.preventDefault();

    if (!urlInput.trim()) {
      alert('Please enter a URL');
      return;
    }

    // Validate URL format
    try {
      new URL(urlInput);
    } catch {
      alert('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    try {
      const data = await apiClient.post('/url/scan', { url: urlInput });
      const result = data.data;

      // Add to history
      setScanHistory([
        {
          ...result,
          scannedAt: new Date(),
        },
        ...scanHistory,
      ].slice(0, 10)); // Keep last 10 scans

      // Clear input
      setUrlInput('');
    } catch (err) {
      alert('Error scanning URL: ' + err.message);
    }
  };

  const clearHistory = () => {
    setScanHistory([]);
  };

  return (
    <div className="url-scanner-page">
      <div className="scanner-container">
        <div className="scanner-header">
          <h1>🔗 URL Security Scanner</h1>
          <p>Check if a website is safe, fraudulent, or contains malware</p>
        </div>

        <form onSubmit={handleScan} className="scanner-form">
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter URL (e.g., https://example.com)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              disabled={scanning}
              className="url-input"
            />
            <button
              type="submit"
              disabled={scanning}
              className="scan-button"
            >
              {scanning ? '🔍 Scanning...' : '🔍 Scan URL'}
            </button>
          </div>
          <p className="input-hint">
            💡 Checks against multiple threat databases for malware, phishing, and fraud indicators
          </p>
        </form>

        {error && (
          <div className="error-banner">
            <p>⚠️ {error}</p>
          </div>
        )}

        {scanHistory.length > 0 && (
          <div className="results-section">
            <div className="results-header">
              <div className="results-title">
                <h2>📊 Scan History</h2>
                <div className="results-stats">
                  <span className="stat">
                    Total: <strong>{scanHistory.length}</strong>
                  </span>
                  <span className="stat malicious">
                    🚨 Malicious: <strong>{scanHistory.filter(r => r.isMalicious).length}</strong>
                  </span>
                  <span className="stat safe">
                    ✅ Safe: <strong>{scanHistory.filter(r => !r.isMalicious).length}</strong>
                  </span>
                </div>
              </div>
              <button onClick={clearHistory} className="clear-button">
                Clear History
              </button>
            </div>

            <div className="results-list">
              {scanHistory.map((result, idx) => (
                <div
                  key={idx}
                  className={`result-item ${result.threatLevel === 'danger' ? 'malicious' : result.threatLevel === 'warning' ? 'warning' : 'safe'}`}
                >
                  <div className="result-header">
                    <div className="result-info">
                      <span className="result-icon">
                        {result.isMalicious ? '🚨' : '✅'}
                      </span>
                      <div className="result-details">
                        <a href={result.url} target="_blank" rel="noopener noreferrer" className="result-url">
                          {result.url}
                        </a>
                        <div className="result-time">
                          Scanned: {new Date(result.scannedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className={`result-status ${result.threatLevel === 'danger' ? 'malicious' : result.threatLevel === 'warning' ? 'warning' : 'safe'}`}>
                      {result.threatLevel === 'danger' ? '🚨 MALICIOUS' : result.threatLevel === 'warning' ? '⚠️ SUSPICIOUS' : '✅ SAFE'}
                    </div>
                  </div>

                  {result.isMalicious && (
                    <div className="result-threats">
                      <div className="threat-header">
                        <strong>Risk Level: {result.riskLevel.toUpperCase()}</strong>
                        {result.sources && result.sources.length > 0 && (
                          <div className="threat-sources">
                            Detected by: {result.sources.join(', ')}
                          </div>
                        )}
                      </div>
                      {result.threats && result.threats.length > 0 && (
                        <div className="threat-details">
                          {result.threats.map((threat, i) => (
                            <div key={i} className="threat-item">
                              ⚠️ {threat}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {!result.isMalicious && result.details?.basicChecks?.warnings && (
                    <div className="result-warnings">
                      {result.details.basicChecks.warnings.map((warning, i) => (
                        <div key={i} className="warning-item">
                          ℹ️ {warning}
                        </div>
                      ))}
                    </div>
                  )}

                  {!result.isMalicious && (!result.details?.basicChecks?.warnings || result.details.basicChecks.warnings.length === 0) && (
                    <div className="result-safe-message">
                      ✅ No obvious threats detected
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="scanner-info">
          <h3>🛡️ How It Works</h3>
          <ul>
            <li><strong>Malware Detection:</strong> Checks against malware databases</li>
            <li><strong>Phishing Detection:</strong> Identifies phishing and social engineering sites</li>
            <li><strong>Domain Analysis:</strong> Evaluates domain reputation and age</li>
            <li><strong>Content Scanning:</strong> Detects suspicious patterns and keywords</li>
            <li><strong>TLD Analysis:</strong> Identifies high-risk domain extensions</li>
          </ul>
        </div>

        <div className="scanner-examples">
          <h3>🧪 Test URLs</h3>
          <p>Try scanning these URLs to see how the detector works:</p>
          <div className="example-urls">
            <button
              onClick={() => setUrlInput('https://bit.ly/test-shortened')}
              className="example-btn"
              title="Shortened URLs hide the real destination"
            >
              🔗 Shortened URL (bit.ly)
            </button>
            <button
              onClick={() => setUrlInput('https://paypa1-verify-account.tk/')}
              className="example-btn"
              title="Lookalike domain with verification keywords"
            >
              🎭 Lookalike Domain
            </button>
            <button
              onClick={() => setUrlInput('https://example.tk/login/verify/confirm')}
              className="example-btn"
              title="Multiple login keywords"
            >
              🔐 Login/Verification Keywords
            </button>
            <button
              onClick={() => setUrlInput('https://very-long-domain-name-with-many-subdomains.example.tk/path/to/resource')}
              className="example-btn"
              title="Unusually long domain"
            >
              📏 Suspicious Length
            </button>
          </div>
          <p className="example-note">
            💡 <strong>Note:</strong> These are example patterns. Real malicious URLs will be detected by the threat databases.
            The detector checks for multiple patterns: shortened URLs, suspicious TLDs (.tk, .ml, .ga), lookalike characters, and more.
          </p>
        </div>

        <div className="scanner-warning">
          <p>
            ⚠️ <strong>Warning:</strong> This tool helps identify potentially dangerous URLs but is not foolproof.
            Always be cautious with unfamiliar links. When in doubt, contact the sender directly to verify.
          </p>
        </div>
      </div>
    </div>
  );
}
