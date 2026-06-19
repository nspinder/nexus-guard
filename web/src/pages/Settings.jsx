import { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/apiClient';
import GmailIntegration from '../components/GmailIntegration';
import OutlookIntegration from '../components/OutlookIntegration';
import NotificationSettings from '../components/NotificationSettings';
import '../styles/Settings.css';

export default function Settings({ authToken: propToken }) {
  const { authToken: token } = useAuth();
  const authToken = propToken || token;
  const [activeTab, setActiveTab] = useState('thresholds');
  const [preferences, setPreferences] = useState({
    lowRiskThreshold: 30,
    mediumRiskThreshold: 60,
    highRiskThreshold: 80,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const data = await apiClient.get('/api/preferences');
      setPreferences(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch preferences:', err);
      setError('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPreferences((prev) => ({
      ...prev,
      [name]: parseInt(value),
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    if (
      preferences.lowRiskThreshold >= preferences.mediumRiskThreshold ||
      preferences.mediumRiskThreshold >= preferences.highRiskThreshold
    ) {
      setError('Thresholds must be in order: Low < Medium < High');
      setSaving(false);
      return;
    }

    try {
      await apiClient.put('/api/preferences', preferences);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save preferences:', err);
      setError(err.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'thresholds', label: 'Alert Thresholds', icon: AlertCircle },
    { id: 'consent', label: 'Privacy & Consent', icon: CheckCircle },
    { id: 'email', label: 'Email Connections', icon: Mail },
    { id: 'agreements', label: 'User Agreements', icon: SettingsIcon },
  ];

  if (loading) {
    return <div className="settings-container">Loading preferences...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        </div>
        <p className="text-slate-600">Manage your preferences, privacy, and integrations</p>
      </div>

      <div className="flex gap-2 mb-8 border-b border-e2e8f0 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition whitespace-nowrap ${
                isActive
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-6">
        {activeTab === 'thresholds' && (
          <div className="settings-container">
            <div className="settings-card">
              <h1>Alert Thresholds</h1>
              <p className="settings-description">
                Customize the percentage thresholds for scam detection alerts
              </p>

              <form onSubmit={handleSave}>
                <div className="threshold-section">
                  <div className="threshold-item">
                    <div className="threshold-label">
                      <label htmlFor="lowRiskThreshold">
                        🟢 Low Risk Threshold
                      </label>
                      <span className="threshold-value">{preferences.lowRiskThreshold}%</span>
                    </div>
                    <input
                      type="range"
                      id="lowRiskThreshold"
                      name="lowRiskThreshold"
                      min="0"
                      max="100"
                      value={preferences.lowRiskThreshold}
                      onChange={handleChange}
                      className="threshold-slider low-risk"
                    />
                    <p className="threshold-description">
                      Messages below this percentage are considered low risk
                    </p>
                  </div>

                  <div className="threshold-item">
                    <div className="threshold-label">
                      <label htmlFor="mediumRiskThreshold">
                        🟠 Medium Risk Threshold
                      </label>
                      <span className="threshold-value">{preferences.mediumRiskThreshold}%</span>
                    </div>
                    <input
                      type="range"
                      id="mediumRiskThreshold"
                      name="mediumRiskThreshold"
                      min="0"
                      max="100"
                      value={preferences.mediumRiskThreshold}
                      onChange={handleChange}
                      className="threshold-slider medium-risk"
                    />
                    <p className="threshold-description">
                      Messages between low and this percentage are considered medium risk
                    </p>
                  </div>

                  <div className="threshold-item">
                    <div className="threshold-label">
                      <label htmlFor="highRiskThreshold">
                        🔴 High Risk Threshold
                      </label>
                      <span className="threshold-value">{preferences.highRiskThreshold}%</span>
                    </div>
                    <input
                      type="range"
                      id="highRiskThreshold"
                      name="highRiskThreshold"
                      min="0"
                      max="100"
                      value={preferences.highRiskThreshold}
                      onChange={handleChange}
                      className="threshold-slider high-risk"
                    />
                    <p className="threshold-description">
                      Messages above this percentage trigger alerts and show as high risk
                    </p>
                  </div>
                </div>

                <div className="threshold-preview">
                  <h3>Risk Level Preview</h3>
                  <div className="preview-rows">
                    <div className="preview-row">
                      <span className="preview-label">0% - {preferences.lowRiskThreshold - 1}%</span>
                      <span className="badge low-risk-badge">Low Risk</span>
                    </div>
                    <div className="preview-row">
                      <span className="preview-label">
                        {preferences.lowRiskThreshold}% - {preferences.mediumRiskThreshold - 1}%
                      </span>
                      <span className="badge medium-risk-badge">Medium Risk</span>
                    </div>
                    <div className="preview-row">
                      <span className="preview-label">
                        {preferences.mediumRiskThreshold}% - {preferences.highRiskThreshold - 1}%
                      </span>
                      <span className="badge high-risk-badge">High Risk</span>
                    </div>
                    <div className="preview-row">
                      <span className="preview-label">{preferences.highRiskThreshold}% - 100%</span>
                      <span className="badge critical-risk-badge">Critical</span>
                    </div>
                  </div>
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">✓ Settings saved successfully</div>}

                <button type="submit" disabled={saving} className="save-button">
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'consent' && (
          <div className="bg-white rounded-lg p-8 border border-e2e8f0 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-blue-500" />
              Privacy & Consent Settings
            </h2>

            <div className="space-y-8">
              {/* Email Analysis Consent */}
              <div className="border-b border-e2e8f0 pb-8">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Email Analysis</h3>
                    <p className="text-slate-600 text-sm">
                      Allow NexusGuard to analyze incoming emails for scam indicators.
                      We do not store email contents permanently.
                    </p>
                  </div>
                </div>
              </div>

              {/* Call Analysis Consent */}
              <div className="border-b border-e2e8f0 pb-8">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Call Analysis</h3>
                    <p className="text-slate-600 text-sm">
                      Allow NexusGuard to analyze incoming calls using metadata (caller ID,
                      phone number, duration). No audio is recorded or stored.
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Retention Policy */}
              <div className="pb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Data Retention Policy</h3>
                <p className="text-slate-600 text-sm mb-4">
                  Automatically delete your analysis data after:
                </p>
                <div className="flex items-center gap-4">
                  <select
                    className="px-4 py-2 bg-slate-50 border border-e2e8f0 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value={30}>30 days</option>
                    <option value={60}>60 days</option>
                    <option value={90} selected>90 days</option>
                    <option value={180}>6 months</option>
                    <option value={365}>1 year</option>
                  </select>
                  <p className="text-slate-600 text-sm">
                    (GDPR compliant - default 90 days)
                  </p>
                </div>
              </div>

              {/* Compliance Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-slate-600 text-sm space-y-3">
                <p>
                  <strong className="text-slate-900">Legal Compliance:</strong> NexusGuard complies
                  with GDPR, CCPA, and TCPA regulations. You can request data deletion at any time.
                </p>
                <p>
                  <strong className="text-slate-900">Call Recording Laws:</strong> In some jurisdictions
                  (e.g., CA, NY), recording calls requires all parties' consent. Ensure you comply
                  with your local laws.
                </p>
                <p>
                  <strong className="text-slate-900">Data Deletion:</strong> You can permanently
                  delete any email, call, or alert from your account.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'email' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-8 border border-e2e8f0 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                <Mail className="w-6 h-6 text-blue-500" />
                Email Provider Integrations
              </h2>
              <p className="text-slate-600 mb-8">Connect your email accounts for automatic scam detection and analysis</p>

              <div className="space-y-6">
                <GmailIntegration authToken={authToken} />
                <OutlookIntegration authToken={authToken} />
              </div>
            </div>

            <div className="bg-white rounded-lg p-8 border border-e2e8f0 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Notifications</h2>
              <NotificationSettings />
            </div>
          </div>
        )}

        {activeTab === 'agreements' && (
          <div className="bg-white rounded-lg p-8 border border-e2e8f0 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <SettingsIcon className="w-6 h-6 text-blue-500" />
              Legal & Compliance
            </h2>

            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">General Data Protection Regulation (GDPR)</h3>
                <p className="text-slate-600 mb-3">
                  NexusGuard complies fully with GDPR regulations. You have the right to:
                </p>
                <ul className="list-disc pl-5 text-slate-600 space-y-2">
                  <li>Access your personal data at any time</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of your data (right to be forgotten)</li>
                  <li>Export your data in a portable format</li>
                  <li>Withdraw consent at any time</li>
                </ul>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">California Consumer Privacy Act (CCPA)</h3>
                <p className="text-slate-600 mb-3">
                  NexusGuard respects your privacy rights under CCPA. You have the right to:
                </p>
                <ul className="list-disc pl-5 text-slate-600 space-y-2">
                  <li>Know what personal information is collected</li>
                  <li>Delete personal information collected from you</li>
                  <li>Opt-out of the sale or sharing of personal information</li>
                  <li>Non-discrimination for exercising your rights</li>
                </ul>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Telephone Consumer Protection Act (TCPA)</h3>
                <p className="text-slate-600 mb-3">
                  NexusGuard complies with TCPA requirements for call analysis:
                </p>
                <ul className="list-disc pl-5 text-slate-600 space-y-2">
                  <li>Call recording complies with two-party consent laws</li>
                  <li>We do not make unsolicited automated calls</li>
                  <li>Your consent is required for call analysis</li>
                </ul>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Data Deletion</h3>
                <p className="text-slate-600 mb-3">
                  You can permanently delete any of the following from your account:
                </p>
                <ul className="list-disc pl-5 text-slate-600 space-y-2">
                  <li>Individual email messages and analysis results</li>
                  <li>Phone call records and metadata</li>
                  <li>Message history from WhatsApp and iMessage</li>
                  <li>All alerts and threat detections</li>
                  <li>Your entire account and all associated data</li>
                </ul>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Call Recording Laws</h3>
                <p className="text-slate-600 mb-3">
                  <strong>Important:</strong> Call recording laws vary by jurisdiction:
                </p>
                <ul className="list-disc pl-5 text-slate-600 space-y-2">
                  <li><strong>Two-party consent states:</strong> CA, CT, FL, IL, MD, MI, MT, NH, PA, WA - all parties must consent to recording</li>
                  <li><strong>One-party consent states:</strong> Only the person recording needs to consent</li>
                  <li>Always ensure you comply with your local laws before recording calls</li>
                  <li>NexusGuard analyzes call metadata only, not audio recordings</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Need to Exercise Your Rights?</h3>
                <p className="text-slate-600 mb-4">
                  To request data deletion, access your data, or file a complaint, please contact us at:
                </p>
                <div className="space-y-2">
                  <p className="text-slate-900"><strong>Email:</strong> privacy@nexusguard.com</p>
                  <p className="text-slate-900"><strong>Mail:</strong> NexusGuard Privacy Team, [Company Address]</p>
                  <p className="text-slate-900"><strong>Response Time:</strong> Within 30 days</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
