import React, { useState, useEffect } from 'react';
import { Search, Phone, AlertTriangle, Clock } from 'lucide-react';
import '../styles/PhoneValidator.css';

export default function PhoneValidator() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');

      const response = await fetch('/api/phone/history', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-User-Id': userId,
          'X-User-Email': userEmail,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHistory(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const handleValidate = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!phoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }

    setLoading(true);

    try {
      const authToken = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');

      const response = await fetch('/api/phone/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          'X-User-Id': userId,
          'X-User-Email': userEmail,
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to validate phone number');
        return;
      }

      setResult(data.data);
      setPhoneNumber('');
      loadHistory();
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getThreatIcon = (threatLevel) => {
    if (threatLevel === 'danger') return '🚨';
    if (threatLevel === 'warning') return '⚠️';
    return '✅';
  };

  const getThreatColor = (threatLevel) => {
    if (threatLevel === 'danger') return '#ef4444';
    if (threatLevel === 'warning') return '#f97316';
    return '#22c55e';
  };

  const getThreatText = (threatLevel) => {
    if (threatLevel === 'danger') return 'FLAGGED AS SPAM';
    if (threatLevel === 'warning') return 'SUSPICIOUS';
    return 'SAFE';
  };

  return (
    <div className="phone-validator-container">
      <div className="phone-header">
        <h1>📞 Phone Number Validator</h1>
        <p>Check if a phone number is associated with spam, scams, or fraud</p>
      </div>

      <div className="phone-content">
        <div className="validator-section">
          <form onSubmit={handleValidate} className="validator-form">
            <div className="input-group">
              <Phone className="input-icon" size={20} />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 123-4567 or 555-123-4567"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="validate-btn"
              >
                {loading ? (
                  <><Clock size={18} /> Validating...</>
                ) : (
                  <><Search size={18} /> Validate</>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="error-message">
              <AlertTriangle size={18} />
              {error}
            </div>
          )}

          {result && (
            <div className="result-card">
              <div className="result-header">
                <span style={{ fontSize: '28px' }}>
                  {getThreatIcon(result.threatLevel)}
                </span>
                <h3 style={{ color: getThreatColor(result.threatLevel) }}>
                  {getThreatText(result.threatLevel)}
                </h3>
              </div>

              <div className="result-details">
                <div className="detail-item">
                  <strong>Formatted:</strong>
                  <code>{result.formattedNumber}</code>
                </div>

                <div className="detail-item">
                  <strong>Country:</strong>
                  <span>
                    {result.countryCode.country}
                    {result.countryCode.code && ` (+${result.countryCode.code})`}
                  </span>
                </div>

                <div className="detail-item">
                  <strong>Carrier:</strong>
                  <span>{result.carrier}</span>
                </div>

                <div className="detail-item">
                  <strong>Risk Level:</strong>
                  <span className={`risk-badge risk-${result.riskLevel}`}>
                    {result.riskLevel.toUpperCase()}
                  </span>
                </div>

                {result.isSpam && (
                  <div className="spam-indicator">
                    🚨 This number has been flagged as spam or scam
                  </div>
                )}

                {result.warnings && result.warnings.length > 0 && (
                  <div className="warnings-section">
                    <strong>⚠️ Warnings:</strong>
                    <ul>
                      {result.warnings.map((warning, idx) => (
                        <li key={idx}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.details && (
                  <details className="advanced-details">
                    <summary>Advanced Details</summary>
                    <div className="details-content">
                      {result.details.virusTotalResults?.found && (
                        <div className="detail-item">
                          <strong>VirusTotal Match:</strong>
                          <span style={{ color: '#ef4444' }}>Found in threat database</span>
                        </div>
                      )}

                      {result.details.isShortCode && (
                        <div className="detail-item">
                          <strong>Short Code:</strong>
                          <span>This is a short code (SMS service)</span>
                        </div>
                      )}

                      {result.details.spoofedPattern && (
                        <div className="detail-item">
                          <strong>Spoofed Pattern:</strong>
                          <code>{result.details.spoofedPattern}</code>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>
            </div>
          )}

          <div className="test-numbers">
            <p style={{ marginBottom: '12px', color: '#64748b', fontSize: '14px' }}>
              💡 Test with example numbers:
            </p>
            <div className="button-group">
              <button
                onClick={() => setPhoneNumber('(555) 123-4567')}
                className="test-btn"
              >
                Fictional US Number
              </button>
              <button
                onClick={() => setPhoneNumber('+1-800-555-0123')}
                className="test-btn"
              >
                Toll-Free Number
              </button>
              <button
                onClick={() => setPhoneNumber('+44 20 7946 0958')}
                className="test-btn"
              >
                International Number
              </button>
            </div>
          </div>
        </div>

        <div className="history-section">
          <h2>Recent Validations</h2>
          {history.length === 0 ? (
            <p className="empty-message">No validations yet. Start by entering a phone number above.</p>
          ) : (
            <div className="history-list">
              {history.slice(0, 10).map((item) => (
                <div key={item.id} className="history-item">
                  <div className="history-header">
                    <span className="history-number">{item.formatted}</span>
                    <span
                      className={`threat-badge threat-${item.threatLevel}`}
                      title={item.riskLevel}
                    >
                      {getThreatIcon(item.threatLevel)}
                    </span>
                  </div>
                  <div className="history-info">
                    <small>{item.country}</small>
                    {item.carrier && <small>{item.carrier}</small>}
                    <small className="timestamp">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
