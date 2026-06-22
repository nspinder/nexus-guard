import React from 'react';
import '../styles/URLScanResults.css';

export default function URLScanResults({ urls, onClose }) {
  if (!urls || urls.length === 0) {
    return null;
  }

  const hasMalicious = urls.some(url => url.isMalicious);

  return (
    <div className="url-scan-results">
      <div className="url-scan-header">
        <h3>🔗 URLs Detected in Message</h3>
        {hasMalicious && <span className="malicious-badge">⚠️ Contains Suspicious URLs</span>}
      </div>

      <div className="urls-list">
        {urls.map((url, idx) => (
          <div key={idx} className={`url-item ${url.isMalicious ? 'malicious' : 'safe'}`}>
            <div className="url-icon">
              {url.isMalicious ? '🚨' : '✓'}
            </div>

            <div className="url-details">
              <div className="url-address">
                <a href={url.url} target="_blank" rel="noopener noreferrer" className="url-link">
                  {url.url.substring(0, 60)}...
                </a>
              </div>

              {url.isMalicious && (
                <div className="url-threats">
                  <strong>Risk: {url.riskLevel ? url.riskLevel.toUpperCase() : 'UNKNOWN'}</strong>
                  {Array.isArray(url.sources) && url.sources.length > 0 && (
                    <div className="threat-sources">
                      Detected by: {url.sources.join(', ')}
                    </div>
                  )}
                  {Array.isArray(url.threats) && url.threats.length > 0 && (
                    <div className="threat-list">
                      {url.threats.map((threat, i) => (
                        <div key={i} className="threat-item">
                          ⚠️ {threat}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!url.isMalicious && Array.isArray(url.details?.basicChecks?.warnings) && (
                <div className="url-warnings">
                  {url.details.basicChecks.warnings.map((warning, i) => (
                    <div key={i} className="warning-item">
                      ℹ️ {warning}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="url-scan-footer">
        <p className="url-warning-text">
          ⚠️ Never click suspicious links. If unsure, contact the sender directly to verify.
        </p>
      </div>
    </div>
  );
}
