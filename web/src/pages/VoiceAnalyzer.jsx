import React, { useState, useEffect } from 'react';
import { Mic, AlertTriangle, TrendingUp, Clock, Phone, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/apiClient';
import '../styles/VoiceAnalyzer.css';

export default function VoiceAnalyzer() {
  const { authToken } = useAuth();
  const [transcription, setTranscription] = useState('');
  const [callData, setCallData] = useState({
    duration: '',
    callerId: '',
    callType: 'phone',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadHistory();
    loadStats();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await apiClient.get('/api/voice/history');
      setHistory(data.data || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const loadStats = async () => {
    try {
      const data = await apiClient.get('/api/voice/stats');
      setStats(data.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!transcription.trim()) {
      setError('Please enter a call transcription');
      return;
    }

    if (!authToken) {
      setError('Please log in to analyze');
      return;
    }

    setLoading(true);

    try {
      const data = await apiClient.post('/api/voice/analyze', {
        transcription,
        duration: callData.duration ? parseInt(callData.duration) : null,
        callerId: callData.callerId || null,
        callType: callData.callType,
      });
      setResult(data.data);
      setTranscription('');
      setCallData({ duration: '', callerId: '', callType: 'phone' });
      loadHistory();
      loadStats();
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getThreatColor = (threatLevel) => {
    if (threatLevel === 'danger') return '#ef4444';
    if (threatLevel === 'warning') return '#f97316';
    return '#22c55e';
  };

  const getThreatIcon = (threatLevel) => {
    if (threatLevel === 'danger') return '🚨';
    if (threatLevel === 'warning') return '⚠️';
    return '✅';
  };

  const getThreatText = (threatLevel) => {
    if (threatLevel === 'danger') return 'DANGEROUS CALL';
    if (threatLevel === 'warning') return 'SUSPICIOUS CALL';
    return 'LIKELY SAFE';
  };

  return (
    <div className="voice-analyzer-container">
      <div className="voice-header">
        <h1>🎙️ Voice Call Analysis</h1>
        <p>Detect scams, deepfakes, and suspicious patterns in phone calls</p>
      </div>

      {error && (
        <div className="error-banner">
          <AlertTriangle size={18} />
          {error}
        </div>
      )}

      {stats && (
        <div className="stats-overview">
          <div className="stat-box">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Analyzed</div>
          </div>
          <div className="stat-box danger">
            <div className="stat-number">{stats.danger}</div>
            <div className="stat-label">Dangerous Calls</div>
          </div>
          <div className="stat-box warning">
            <div className="stat-number">{stats.warning}</div>
            <div className="stat-label">Suspicious Calls</div>
          </div>
          <div className="stat-box safe">
            <div className="stat-number">{stats.safe}</div>
            <div className="stat-label">Safe Calls</div>
          </div>
        </div>
      )}

      <div className="voice-content">
        <div className="analyzer-section">
          <form onSubmit={handleAnalyze} className="analyzer-form">
            <h3>Analyze Call Transcript</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Call Type</label>
                <select
                  value={callData.callType}
                  onChange={(e) => setCallData({ ...callData, callType: e.target.value })}
                >
                  <option value="phone">Phone Call</option>
                  <option value="whatsapp">WhatsApp Call</option>
                  <option value="facetime">FaceTime Call</option>
                </select>
              </div>

              <div className="form-group">
                <label>Duration (seconds)</label>
                <input
                  type="number"
                  value={callData.duration}
                  onChange={(e) => setCallData({ ...callData, duration: e.target.value })}
                  placeholder="e.g., 180"
                />
              </div>

              <div className="form-group">
                <label>Caller ID</label>
                <input
                  type="text"
                  value={callData.callerId}
                  onChange={(e) => setCallData({ ...callData, callerId: e.target.value })}
                  placeholder="e.g., +1234567890"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Call Transcript</label>
              <textarea
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
                placeholder="Paste the transcribed text from the phone call here..."
                rows="8"
                required
              />
              <small>{transcription.length} characters</small>
            </div>

            <button type="submit" disabled={loading} className="analyze-btn">
              {loading ? (
                <><Clock size={18} /> Analyzing...</>
              ) : (
                <><Mic size={18} /> Analyze Call</>
              )}
            </button>
          </form>

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

              <div className="risk-scores">
                <div className="risk-item">
                  <strong>Overall Risk:</strong>
                  <div className="risk-bar">
                    <div
                      className="risk-fill"
                      style={{
                        width: `${result.overallRiskScore}%`,
                        backgroundColor: getThreatColor(result.threatLevel),
                      }}
                    />
                  </div>
                  <span>{result.overallRiskScore.toFixed(0)}/100</span>
                </div>

                <div className="risk-item">
                  <strong>Deepfake Risk:</strong>
                  <div className="risk-bar">
                    <div
                      className="risk-fill"
                      style={{
                        width: `${result.deepfakeRisk}%`,
                        backgroundColor: result.deepfakeRisk > 60 ? '#dc2626' : '#f97316',
                      }}
                    />
                  </div>
                  <span>{result.deepfakeRisk.toFixed(0)}/100</span>
                </div>
              </div>

              {result.recommendation && (
                <div
                  className="recommendation"
                  style={{
                    background:
                      result.threatLevel === 'danger'
                        ? '#fee2e2'
                        : result.threatLevel === 'warning'
                        ? '#fef08a'
                        : '#dcfce7',
                    color:
                      result.threatLevel === 'danger'
                        ? '#991b1b'
                        : result.threatLevel === 'warning'
                        ? '#92400e'
                        : '#166534',
                    borderLeft:
                      result.threatLevel === 'danger'
                        ? '4px solid #ef4444'
                        : result.threatLevel === 'warning'
                        ? '4px solid #f59e0b'
                        : '4px solid #22c55e',
                  }}
                >
                  {result.recommendation}
                </div>
              )}

              {result.scamIndicators && result.scamIndicators.length > 0 && (
                <details className="details-section">
                  <summary>Scam Phrases Detected ({result.scamIndicators.length})</summary>
                  <div className="details-content">
                    <div className="indicator-list">
                      {result.scamIndicators.map((indicator, idx) => (
                        <span key={idx} className="indicator-badge">
                          {indicator}
                        </span>
                      ))}
                    </div>
                  </div>
                </details>
              )}

              {result.suspiciousFactors && result.suspiciousFactors.length > 0 && (
                <details className="details-section">
                  <summary>Suspicious Factors ({result.suspiciousFactors.length})</summary>
                  <div className="details-content">
                    <ul>
                      {result.suspiciousFactors.map((factor, idx) => (
                        <li key={idx}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                </details>
              )}

              {result.voicePatterns && (
                <details className="details-section">
                  <summary>Voice Pattern Analysis</summary>
                  <div className="details-content">
                    <div className="pattern-item">
                      <strong>Filler Words:</strong>
                      <span>{result.voicePatterns.filler_words}</span>
                    </div>
                    <div className="pattern-item">
                      <strong>Hesitation Markers:</strong>
                      <span>{result.voicePatterns.hesitation_markers}</span>
                    </div>
                    <div className="pattern-item">
                      <strong>Word Repetitions:</strong>
                      <span>{result.voicePatterns.repetitions}</span>
                    </div>
                    {result.voicePatterns.natural_speech_indicators &&
                      result.voicePatterns.natural_speech_indicators.length > 0 && (
                        <div className="pattern-item">
                          <strong>Naturalness:</strong>
                          <ul>
                            {result.voicePatterns.natural_speech_indicators.map((ind, idx) => (
                              <li key={idx}>{ind}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                </details>
              )}
            </div>
          )}
        </div>

        <div className="history-section">
          <h2>Recent Analyses</h2>
          {history.length === 0 ? (
            <p className="empty-message">No analyses yet. Start by entering a transcript above.</p>
          ) : (
            <div className="history-list">
              {history.slice(0, 10).map((item) => (
                <div key={item.id} className="history-item">
                  <div className="history-header">
                    <span style={{ fontSize: '16px' }}>
                      {getThreatIcon(item.threatLevel)}
                    </span>
                    <div className="history-info">
                      <strong>{item.callType?.toUpperCase() || 'Call'}</strong>
                      {item.callerId && <small>{item.callerId}</small>}
                    </div>
                    <span
                      className="risk-score"
                      style={{ color: getThreatColor(item.threatLevel) }}
                    >
                      {item.overallRiskScore.toFixed(0)}
                    </span>
                  </div>
                  <small className="timestamp">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </small>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="example-section">
        <h3>📋 Example Transcript</h3>
        <p>Try this example to see how the analyzer works:</p>
        <button
          onClick={() =>
            setTranscription(
              `"Hello, this is Officer Johnson from the IRS. We have an urgent matter regarding your tax account. You need to act immediately. Your account has been flagged for suspicious activity and we need you to verify your information right away. Can you confirm your social security number? If we don't hear from you, we'll have no choice but to freeze your account and file legal charges."`
            )
          }
          className="example-btn"
        >
          Load Example
        </button>
      </div>
    </div>
  );
}
