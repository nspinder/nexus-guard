import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, AlertTriangle, Clock, TrendingDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/apiClient';
import '../styles/PasswordChecker.css';

export default function PasswordChecker() {
  const { authToken } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await apiClient.get('/api/password/history');
      setHistory(data.data || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const handleCheck = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!password) {
      setError('Please enter a password');
      return;
    }

    setLoading(true);

    try {
      const data = await apiClient.post('/api/password/check', { password });
      setResult(data.data);
      setPassword('');
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
    if (threatLevel === 'danger') return 'COMPROMISED';
    if (threatLevel === 'warning') return 'RISKY';
    return 'SECURE';
  };

  const getStrengthColor = (strength) => {
    if (strength === 'strong') return '#22c55e';
    if (strength === 'good') return '#3b82f6';
    if (strength === 'fair') return '#f97316';
    return '#ef4444';
  };

  const getStrengthLabel = (score) => {
    if (score < 30) return 'Weak';
    if (score < 60) return 'Fair';
    if (score < 80) return 'Good';
    return 'Strong';
  };

  return (
    <div className="password-checker-container">
      <div className="password-header">
        <h1>🔐 Password Breach Checker</h1>
        <p>Check if your password has been exposed in data breaches and assess its strength</p>
      </div>

      <div className="password-content">
        <div className="checker-section">
          <form onSubmit={handleCheck} className="checker-form">
            <div className="password-input-group">
              <Lock className="input-icon" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password to check..."
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="toggle-btn"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="check-btn"
              >
                {loading ? (
                  <><Clock size={18} /> Checking...</>
                ) : (
                  <>Check Password</>
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
                <span style={{ fontSize: '32px' }}>
                  {getThreatIcon(result.threatLevel)}
                </span>
                <h3 style={{ color: getThreatColor(result.threatLevel) }}>
                  {getThreatText(result.threatLevel)}
                </h3>
              </div>

              <div className="result-details">
                {result.isBreach && (
                  <div className="breach-alert">
                    🚨 Password found in {result.breachCount} data breach{result.breachCount > 1 ? 'es' : ''}!
                    {result.breachCount > 0 && ' Change it immediately across all accounts.'}
                  </div>
                )}

                {result.isCommon && (
                  <div className="common-alert">
                    ⚠️ This is a very common password. Attackers try this first.
                  </div>
                )}

                <div className="strength-section">
                  <div className="strength-header">
                    <strong>Password Strength:</strong>
                    <span
                      className="strength-label"
                      style={{ color: getStrengthColor(result.strengthLevel) }}
                    >
                      {result.strengthLevel.toUpperCase()}
                    </span>
                  </div>
                  <div className="strength-bar">
                    <div
                      className="strength-fill"
                      style={{
                        width: `${result.strength}%`,
                        backgroundColor: getStrengthColor(result.strengthLevel),
                      }}
                    />
                  </div>
                  <span className="strength-score">{result.strength}/100</span>
                </div>

                <div className="characteristics">
                  <strong>Characteristics:</strong>
                  <div className="char-grid">
                    <div className={`char-item ${result.strengthDetails.hasLowercase ? 'yes' : 'no'}`}>
                      {result.strengthDetails.hasLowercase ? '✅' : '❌'} Lowercase
                    </div>
                    <div className={`char-item ${result.strengthDetails.hasUppercase ? 'yes' : 'no'}`}>
                      {result.strengthDetails.hasUppercase ? '✅' : '❌'} Uppercase
                    </div>
                    <div className={`char-item ${result.strengthDetails.hasNumbers ? 'yes' : 'no'}`}>
                      {result.strengthDetails.hasNumbers ? '✅' : '❌'} Numbers
                    </div>
                    <div className={`char-item ${result.strengthDetails.hasSpecialChars ? 'yes' : 'no'}`}>
                      {result.strengthDetails.hasSpecialChars ? '✅' : '❌'} Special Chars
                    </div>
                    <div className={`char-item ${result.strengthDetails.length >= 12 ? 'yes' : 'no'}`}>
                      {result.strengthDetails.length >= 12 ? '✅' : '❌'} Length {result.strengthDetails.length}+
                    </div>
                    <div className={`char-item ${!result.strengthDetails.isSequential ? 'yes' : 'no'}`}>
                      {!result.strengthDetails.isSequential ? '✅' : '❌'} No Sequential
                    </div>
                  </div>
                </div>

                {result.recommendations && result.recommendations.length > 0 && (
                  <div className="recommendations">
                    <strong>💡 Recommendations:</strong>
                    <ul>
                      {result.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <details className="breach-details">
                  <summary>Breach Database Details</summary>
                  <div className="details-content">
                    {result.details && result.details.hibp && (
                      <div>
                        <p>
                          <strong>Have I Been Pwned Status:</strong>{' '}
                          {result.details.hibp.checked ? (
                            result.details.hibp.isBreach ? (
                              <span style={{ color: '#ef4444' }}>FOUND IN {result.details.hibp.breachCount} BREACHES</span>
                            ) : (
                              <span style={{ color: '#22c55e' }}>NOT FOUND (Good!)</span>
                            )
                          ) : (
                            <span>Unable to check</span>
                          )}
                        </p>
                        <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                          Privacy: Your password is hashed before sending to the API. Only the first 5 characters
                          of the hash are sent.
                        </p>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            </div>
          )}

          <div className="tips-section">
            <h3>🛡️ Password Tips</h3>
            <ul>
              <li>Use unique passwords for important accounts (email, banking, etc.)</li>
              <li>Use a password manager to generate and store strong passwords</li>
              <li>Enable two-factor authentication when available</li>
              <li>Never share your password with anyone</li>
              <li>Change passwords if they appear in data breaches</li>
              <li>At least 12 characters is recommended for strong security</li>
            </ul>
          </div>
        </div>

        <div className="history-section">
          <h2>Recent Checks</h2>
          {history.length === 0 ? (
            <p className="empty-message">No checks yet. Enter a password above to get started.</p>
          ) : (
            <div className="history-list">
              {history.slice(0, 10).map((item) => (
                <div key={item.id} className="history-item">
                  <div className="history-header">
                    <div className="history-strength">
                      <span style={{ color: getStrengthColor(item.strength) }}>
                        {item.strength.toUpperCase()}
                      </span>
                    </div>
                    <span className={`threat-badge threat-${item.threatLevel}`}>
                      {getThreatIcon(item.threatLevel)}
                    </span>
                  </div>
                  <div className="history-info">
                    {item.isBreach && <small style={{ color: '#ef4444' }}>⚠️ In breach</small>}
                    {item.isCommon && <small style={{ color: '#f97316' }}>Common password</small>}
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
