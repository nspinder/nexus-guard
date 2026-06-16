import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, AlertTriangle, MessageSquare, Search, Plus } from 'lucide-react';
import '../styles/CommunityReports.css';

export default function CommunityReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [userVotes, setUserVotes] = useState({});

  const [formData, setFormData] = useState({
    type: 'url',
    target: '',
    threatType: 'phishing',
    description: '',
    evidence: '',
  });

  useEffect(() => {
    loadReports();
  }, [filterType]);

  const loadReports = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (filterType) params.append('type', filterType);
      params.append('limit', '50');

      const response = await fetch(`/api/community/reports?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'X-User-Id': localStorage.getItem('userId'),
          'X-User-Email': localStorage.getItem('userEmail'),
        },
      });

      const data = await response.json();

      if (data.success) {
        setReports(data.data);
        setUserVotes(data.userVotes || {});
      } else {
        setError(data.error || 'Failed to load reports');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      loadReports();
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/community/reports/search/${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'X-User-Id': localStorage.getItem('userId'),
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setReports(data.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.target.trim()) {
      setError('Please enter the target (URL, phone, or email)');
      return;
    }

    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setError('Please log in to create a report');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/community/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          'X-User-Id': localStorage.getItem('userId'),
          'X-User-Email': localStorage.getItem('userEmail'),
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setFormData({
          type: 'url',
          target: '',
          threatType: 'phishing',
          description: '',
          evidence: '',
        });
        setShowForm(false);
        loadReports();
      } else {
        setError(data.error || 'Failed to create report');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (reportId, voteType) => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setError('Please log in to vote');
      return;
    }

    try {
      const response = await fetch(`/api/community/reports/${reportId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          'X-User-Id': localStorage.getItem('userId'),
        },
        body: JSON.stringify({ voteType }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local votes
        setUserVotes(prev => ({
          ...prev,
          [reportId]: prev[reportId] === voteType ? null : voteType,
        }));
        loadReports();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const getThreatColor = (threatType) => {
    const colors = {
      phishing: '#ef4444',
      malware: '#dc2626',
      spam: '#f97316',
      scam: '#f59e0b',
      other: '#8b5cf6',
    };
    return colors[threatType] || '#64748b';
  };

  const getThreatIcon = (threatType) => {
    const icons = {
      phishing: '🎣',
      malware: '⚠️',
      spam: '📧',
      scam: '💰',
      other: '❓',
    };
    return icons[threatType] || '📋';
  };

  return (
    <div className="community-reports-container">
      <div className="reports-header">
        <h1>🤝 Community Threat Reports</h1>
        <p>Help protect others by reporting scams, malware, and threats</p>
      </div>

      {error && (
        <div className="error-banner">
          <AlertTriangle size={18} />
          {error}
        </div>
      )}

      <div className="reports-toolbar">
        <form onSubmit={handleSearch} className="search-form">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by URL, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" disabled={loading}>Search</button>
        </form>

        <button
          onClick={() => setShowForm(!showForm)}
          className="new-report-btn"
        >
          <Plus size={18} />
          New Report
        </button>
      </div>

      {showForm && (
        <div className="report-form-container">
          <h3>Report a Threat</h3>
          <form onSubmit={handleSubmitReport} className="report-form">
            <div className="form-row">
              <div className="form-group">
                <label>Type</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  <option value="url">URL</option>
                  <option value="phone">Phone Number</option>
                  <option value="email">Email Address</option>
                </select>
              </div>

              <div className="form-group">
                <label>Threat Type</label>
                <select
                  value={formData.threatType}
                  onChange={(e) =>
                    setFormData({ ...formData, threatType: e.target.value })
                  }
                >
                  <option value="phishing">Phishing</option>
                  <option value="malware">Malware</option>
                  <option value="spam">Spam</option>
                  <option value="scam">Scam</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Target (URL, phone, or email)</label>
              <input
                type="text"
                placeholder="Enter the suspicious URL, phone number, or email"
                value={formData.target}
                onChange={(e) =>
                  setFormData({ ...formData, target: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                placeholder="Describe what happened and why you believe this is a threat..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows="4"
                required
              />
            </div>

            <div className="form-group">
              <label>Evidence (optional)</label>
              <textarea
                placeholder="Any additional details, screenshots, or evidence..."
                value={formData.evidence}
                onChange={(e) =>
                  setFormData({ ...formData, evidence: e.target.value })
                }
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={loading}>
                Submit Report
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="filter-tabs">
        <button
          className={`tab ${!filterType ? 'active' : ''}`}
          onClick={() => setFilterType('')}
        >
          All Reports
        </button>
        <button
          className={`tab ${filterType === 'url' ? 'active' : ''}`}
          onClick={() => setFilterType('url')}
        >
          URLs
        </button>
        <button
          className={`tab ${filterType === 'phone' ? 'active' : ''}`}
          onClick={() => setFilterType('phone')}
        >
          Phone Numbers
        </button>
        <button
          className={`tab ${filterType === 'email' ? 'active' : ''}`}
          onClick={() => setFilterType('email')}
        >
          Emails
        </button>
      </div>

      {loading && <div className="loading">Loading reports...</div>}

      {!loading && reports.length === 0 && (
        <div className="empty-state">
          <MessageSquare size={48} />
          <p>No reports found. Be the first to report!</p>
        </div>
      )}

      <div className="reports-list">
        {reports.map((report) => (
          <div key={report.id} className="report-card">
            <div className="report-header">
              <div className="threat-info">
                <span className="threat-icon" style={{ fontSize: '20px' }}>
                  {getThreatIcon(report.threatType)}
                </span>
                <div className="threat-details">
                  <h4>{report.target}</h4>
                  <span
                    className="threat-label"
                    style={{ color: getThreatColor(report.threatType) }}
                  >
                    {report.threatType.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="report-votes">
                <button
                  className={`vote-btn ${
                    userVotes[report.id] === 'upvote' ? 'active' : ''
                  }`}
                  onClick={() => handleVote(report.id, 'upvote')}
                >
                  <ThumbsUp size={16} />
                  {report.upvotes}
                </button>
                <button
                  className={`vote-btn ${
                    userVotes[report.id] === 'downvote' ? 'active' : ''
                  }`}
                  onClick={() => handleVote(report.id, 'downvote')}
                >
                  <ThumbsDown size={16} />
                  {report.downvotes}
                </button>
              </div>
            </div>

            <div className="report-body">
              <p className="description">{report.description}</p>
              {report.evidence && (
                <details className="evidence-section">
                  <summary>View Evidence</summary>
                  <p>{report.evidence}</p>
                </details>
              )}
            </div>

            <div className="report-footer">
              <span className="report-type">{report.type.toUpperCase()}</span>
              <span className="report-date">
                {new Date(report.createdAt).toLocaleDateString()}
              </span>
              {report.status && (
                <span
                  className={`status-badge status-${report.status}`}
                >
                  {report.status.toUpperCase()}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
