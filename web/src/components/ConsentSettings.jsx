import { useState, useEffect } from 'react';
import { Settings, CheckCircle } from 'lucide-react';
import GmailIntegration from './GmailIntegration';

export default function ConsentSettings({ authToken }) {
  const [emailConsent, setEmailConsent] = useState(false);
  const [callConsent, setCallConsent] = useState(false);
  const [dataRetention, setDataRetention] = useState(90);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load user's consent preferences
    const savedConsent = localStorage.getItem('userConsent');
    if (savedConsent) {
      const consent = JSON.parse(savedConsent);
      setEmailConsent(consent.email);
      setCallConsent(consent.call);
      setDataRetention(consent.retention || 90);
    }
  }, []);

  const handleSave = async () => {
    try {
      const response = await fetch('/api/auth/consent', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          emailConsent,
          callConsent,
        }),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save consent:', error);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-8 space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Privacy & Consent</h2>
          </div>
          <p className="text-slate-400">
            Control how NexusGuard analyzes your communications
          </p>
        </div>

        {/* Email Consent */}
        <div className="border-t border-slate-700 pt-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Email Analysis</h3>
              <p className="text-slate-400 text-sm">
                Allow NexusGuard to analyze incoming emails for scam indicators.
                We do not store email contents permanently.
              </p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={emailConsent}
                onChange={(e) => setEmailConsent(e.target.checked)}
                className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-600 cursor-pointer"
              />
              <span className="text-slate-300 font-medium">
                {emailConsent ? 'Enabled' : 'Disabled'}
              </span>
            </label>
          </div>
        </div>

        {/* Call Consent */}
        <div className="border-t border-slate-700 pt-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Call Analysis</h3>
              <p className="text-slate-400 text-sm">
                Allow NexusGuard to analyze incoming calls using metadata (caller ID,
                phone number, duration). No audio is recorded or stored.
              </p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={callConsent}
                onChange={(e) => setCallConsent(e.target.checked)}
                className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-600 cursor-pointer"
              />
              <span className="text-slate-300 font-medium">
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
        <div className="border-t border-slate-700 pt-8">
          <h3 className="text-lg font-semibold text-white mb-4">Data Retention Policy</h3>
          <p className="text-slate-400 text-sm mb-4">
            Automatically delete your analysis data after:
          </p>
          <div className="flex items-center gap-4">
            <select
              value={dataRetention}
              onChange={(e) => setDataRetention(parseInt(e.target.value))}
              className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days</option>
              <option value={180}>6 months</option>
              <option value={365}>1 year</option>
            </select>
            <p className="text-slate-400 text-sm">
              (GDPR compliant - default 90 days)
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="border-t border-slate-700 pt-8 flex items-center justify-between">
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

      {/* Gmail Integration */}
      <div className="mt-8">
        <GmailIntegration authToken={authToken} />
      </div>

      {/* Compliance Info */}
      <div className="mt-8 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6 text-slate-400 text-sm space-y-3">
        <p>
          <strong className="text-slate-300">Legal Compliance:</strong> NexusGuard complies
          with GDPR, CCPA, and TCPA regulations. You can request data deletion at any time.
        </p>
        <p>
          <strong className="text-slate-300">Call Recording Laws:</strong> In some jurisdictions
          (e.g., CA, NY), recording calls requires all parties' consent. Ensure you comply
          with your local laws.
        </p>
        <p>
          <strong className="text-slate-300">Data Deletion:</strong> You can permanently
          delete any email, call, or alert from your account.
        </p>
      </div>
    </div>
  );
}
