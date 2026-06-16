import { useState, useEffect } from 'react';
import { Settings, CheckCircle } from 'lucide-react';
import GmailIntegration from './GmailIntegration';
import OutlookIntegration from './OutlookIntegration';
import NotificationSettings from './NotificationSettings';

export default function ConsentSettings({ authToken }) {
  const [emailConsent, setEmailConsent] = useState(false);
  const [callConsent, setCallConsent] = useState(false);
  const [dataRetention, setDataRetention] = useState(90);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load user's consent preferences from localStorage
    const savedConsent = localStorage.getItem('userConsent');
    if (savedConsent) {
      try {
        const consent = JSON.parse(savedConsent);
        setEmailConsent(consent.email);
        setCallConsent(consent.call);
        setDataRetention(consent.retention || 90);
      } catch (err) {
        console.error('Failed to parse consent:', err);
      }
    }
  }, []);

  const handleSave = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');

      const response = await fetch('/api/auth/consent', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
          'X-User-Id': userId,
          'X-User-Email': userEmail,
        },
        body: JSON.stringify({
          emailConsent,
          callConsent,
        }),
      });

      if (response.ok) {
        // Persist to localStorage
        localStorage.setItem('userConsent', JSON.stringify({
          email: emailConsent,
          call: callConsent,
          retention: dataRetention,
        }));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const error = await response.json();
        console.error('Save consent error:', error);
        alert(`Error: ${error.error || 'Failed to save'}`);
      }
    } catch (error) {
      console.error('Failed to save consent:', error);
      alert('Error saving preferences: ' + error.message);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-white/50 backdrop-blur border border-e2e8f0 rounded-lg p-8 space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Privacy & Consent</h2>
          </div>
          <p className="text-475569">
            Control how NexusGuard analyzes your communications
          </p>
        </div>

        {/* Email Consent */}
        <div className="border-t border-e2e8f0 pt-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Email Analysis</h3>
              <p className="text-475569 text-sm">
                Allow NexusGuard to analyze incoming emails for scam indicators.
                We do not store email contents permanently.
              </p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={emailConsent}
                onChange={(e) => setEmailConsent(e.target.checked)}
                className="w-5 h-5 rounded border-cbd5e1 bg-f1f5f9 text-blue-600 cursor-pointer"
              />
              <span className="text-475569 font-medium">
                {emailConsent ? 'Enabled' : 'Disabled'}
              </span>
            </label>
          </div>
        </div>

        {/* Call Consent */}
        <div className="border-t border-e2e8f0 pt-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Call Analysis</h3>
              <p className="text-475569 text-sm">
                Allow NexusGuard to analyze incoming calls using metadata (caller ID,
                phone number, duration). No audio is recorded or stored.
              </p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={callConsent}
                onChange={(e) => setCallConsent(e.target.checked)}
                className="w-5 h-5 rounded border-cbd5e1 bg-f1f5f9 text-blue-600 cursor-pointer"
              />
              <span className="text-475569 font-medium">
                {callConsent ? 'Enabled' : 'Disabled'}
              </span>
            </label>
          </div>

          {callConsent && (
            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-300 text-sm">
              ℹ️ By enabling call analysis, you consent to NexusGuard monitoring incoming call
              metadata in accordance with local laws. Call recording must comply with your
              jurisdiction's recording consent laws.
            </div>
          )}
        </div>

        {/* Data Retention */}
        <div className="border-t border-e2e8f0 pt-8">
          <h3 className="text-lg font-semibold text-white mb-4">Data Retention Policy</h3>
          <p className="text-475569 text-sm mb-4">
            Automatically delete your analysis data after:
          </p>
          <div className="flex items-center gap-4">
            <select
              value={dataRetention}
              onChange={(e) => setDataRetention(parseInt(e.target.value))}
              className="px-4 py-2 bg-f1f5f9/50 border border-cbd5e1 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days</option>
              <option value={180}>6 months</option>
              <option value={365}>1 year</option>
            </select>
            <p className="text-475569 text-sm">
              (GDPR compliant - default 90 days)
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="border-t border-e2e8f0 pt-8 flex items-center justify-between">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
          >
            Save Preferences
          </button>

          {saved && (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span>Saved successfully</span>
            </div>
          )}
        </div>
      </div>

      {/* Email Integrations */}
      <div className="mt-8 space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Email Provider Integrations</h3>
          <p className="text-475569 text-sm mb-4">Connect your email accounts for automatic scam detection</p>
        </div>

        <GmailIntegration authToken={authToken} />
        <OutlookIntegration authToken={authToken} />
      </div>

      {/* Notification Settings */}
      <div className="mt-8">
        <NotificationSettings />
      </div>

      {/* Compliance Info */}
      <div className="mt-8 bg-white/50 backdrop-blur border border-e2e8f0 rounded-lg p-6 text-475569 text-sm space-y-3">
        <p>
          <strong className="text-475569">Legal Compliance:</strong> NexusGuard complies
          with GDPR, CCPA, and TCPA regulations. You can request data deletion at any time.
        </p>
        <p>
          <strong className="text-475569">Call Recording Laws:</strong> In some jurisdictions
          (e.g., CA, NY), recording calls requires all parties' consent. Ensure you comply
          with your local laws.
        </p>
        <p>
          <strong className="text-475569">Data Deletion:</strong> You can permanently
          delete any email, call, or alert from your account.
        </p>
      </div>
    </div>
  );
}
