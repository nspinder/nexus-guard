import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Phone, MessageCircle, AlertCircle, Zap, Filter, Search } from 'lucide-react';
import apiClient from '../services/apiClient';
import '../styles/AnalysisHub.css';

export default function AnalysisHub() {
  const { authToken } = useAuth();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    fetchAnalyses();
  }, [filterType, riskFilter, sortBy, authToken]);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch different types of analyses
      const [callsRes, messagesRes, urlsRes] = await Promise.all([
        apiClient.get('/calls/history?limit=50').catch(() => ({ calls: [] })),
        apiClient.get('/imessage/history?limit=50').catch(() => ({ messages: [] })),
        apiClient.get('/url/history?limit=50').catch(() => ({ scans: [] })),
      ]);

      // Combine and format all analyses
      const allAnalyses = [
        ...(callsRes.calls || []).map(c => ({
          id: c.id,
          type: 'call',
          title: `Call from ${c.callerId || 'Unknown'}`,
          description: c.platform || 'Phone Call',
          probability: c.analysis?.probability || 0,
          riskLevel: c.analysis?.riskLevel || 'low',
          timestamp: c.createdAt || new Date(),
          details: c.analysis,
          flags: c.analysis?.flags || [],
        })),
        ...(messagesRes.messages || []).map(m => ({
          id: m.id,
          type: 'message',
          title: `Message from ${m.sender || 'Unknown'}`,
          description: m.text?.substring(0, 100) + (m.text?.length > 100 ? '...' : ''),
          probability: m.analysis?.probability || 0,
          riskLevel: m.analysis?.riskLevel || 'low',
          timestamp: m.createdAt || new Date(),
          details: m.analysis,
          flags: m.analysis?.flags || [],
        })),
        ...(urlsRes.scans || []).map(u => ({
          id: u.id,
          type: 'url',
          title: `URL: ${u.url?.substring(0, 50)}...`,
          description: u.url || 'URL Scan',
          probability: u.threatLevel === 'danger' ? 85 : u.threatLevel === 'warning' ? 60 : 20,
          riskLevel: u.threatLevel === 'danger' ? 'high' : u.threatLevel === 'warning' ? 'medium' : 'low',
          timestamp: u.createdAt || new Date(),
          details: { sources: u.sources, threats: u.threats },
          flags: u.threats || [],
        })),
      ];

      // Apply filters
      let filtered = allAnalyses;

      if (filterType !== 'all') {
        filtered = filtered.filter(a => a.type === filterType);
      }

      if (riskFilter !== 'all') {
        filtered = filtered.filter(a => a.riskLevel === riskFilter);
      }

      if (searchQuery) {
        filtered = filtered.filter(a =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Sort
      if (sortBy === 'recent') {
        filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      } else if (sortBy === 'riskiest') {
        const riskOrder = { high: 3, medium: 2, low: 1 };
        filtered.sort((a, b) => (riskOrder[b.riskLevel] || 0) - (riskOrder[a.riskLevel] || 0));
      } else if (sortBy === 'highestScore') {
        filtered.sort((a, b) => b.probability - a.probability);
      }

      setAnalyses(filtered);
    } catch (err) {
      console.error('Failed to fetch analyses:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      call: '📞',
      message: '📨',
      url: '🔗',
    };
    return icons[type] || '⚠️';
  };

  const getTypeLabel = (type) => {
    const labels = {
      call: 'Call Analysis',
      message: 'Message Analysis',
      url: 'URL Scan',
    };
    return labels[type] || type;
  };

  const getRiskColor = (riskLevel) => {
    const colors = {
      high: '#ef4444',
      medium: '#f97316',
      low: '#22c55e',
    };
    return colors[riskLevel] || '#64748b';
  };

  const getRiskBgColor = (riskLevel) => {
    const colors = {
      high: 'rgba(239, 68, 68, 0.1)',
      medium: 'rgba(249, 115, 22, 0.1)',
      low: 'rgba(34, 197, 94, 0.1)',
    };
    return colors[riskLevel] || 'rgba(100, 116, 139, 0.1)';
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="analysis-hub">
      <div className="hub-header">
        <h1>📊 Analysis Hub</h1>
        <p>Review all threat analyses from your desktop app and web tools</p>
      </div>

      <div className="hub-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search analyses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <div className="filter-item">
            <label>Type:</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">All Types</option>
              <option value="call">📞 Calls</option>
              <option value="message">📨 Messages</option>
              <option value="url">🔗 URLs</option>
            </select>
          </div>

          <div className="filter-item">
            <label>Risk Level:</label>
            <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
              <option value="all">All Risks</option>
              <option value="high">🔴 High</option>
              <option value="medium">🟠 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
          </div>

          <div className="filter-item">
            <label>Sort By:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="recent">Most Recent</option>
              <option value="riskiest">Riskiest First</option>
              <option value="highestScore">Highest Score</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading analyses...</p>
        </div>
      ) : analyses.length === 0 ? (
        <div className="empty-state">
          <Zap size={48} />
          <h3>No analyses yet</h3>
          <p>Start using the desktop app or other NexusGuard tools to see analyses here.</p>
        </div>
      ) : (
        <div className="analyses-list">
          <div className="list-header">
            <p className="count">Found {analyses.length} analyses</p>
          </div>

          {analyses.map((analysis) => (
            <div key={analysis.id} className="analysis-card">
              <div className="card-header">
                <div className="type-badge">{getTypeIcon(analysis.type)}</div>
                <div className="card-title-section">
                  <h3>{analysis.title}</h3>
                  <p className="type-label">{getTypeLabel(analysis.type)}</p>
                </div>
                <div className="risk-badge" style={{ backgroundColor: getRiskBgColor(analysis.riskLevel) }}>
                  <span style={{ color: getRiskColor(analysis.riskLevel) }}>
                    {analysis.riskLevel.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="card-content">
                <p className="description">{analysis.description}</p>

                <div className="metrics">
                  <div className="metric">
                    <span className="label">Threat Probability:</span>
                    <span className="value" style={{ color: getRiskColor(analysis.riskLevel) }}>
                      {Math.round(analysis.probability)}%
                    </span>
                  </div>
                  <div className="metric">
                    <span className="label">Analyzed:</span>
                    <span className="value">{formatDate(analysis.timestamp)}</span>
                  </div>
                </div>

                {analysis.flags && analysis.flags.length > 0 && (
                  <div className="flags-section">
                    <p className="flags-label">🚩 Red Flags Detected:</p>
                    <ul className="flags-list">
                      {analysis.flags.slice(0, 3).map((flag, idx) => (
                        <li key={idx}>{flag}</li>
                      ))}
                      {analysis.flags.length > 3 && (
                        <li className="more-flags">+{analysis.flags.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                )}

                {analysis.details?.reasoning && (
                  <div className="reasoning-section">
                    <p className="reasoning-label">📝 Analysis:</p>
                    <p className="reasoning">{analysis.details.reasoning}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
