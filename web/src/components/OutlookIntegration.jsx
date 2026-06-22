import { useState, useEffect } from 'react';
import { Mail, Check, Link as LinkIcon, Unlink } from 'lucide-react';

export default function OutlookIntegration({ authToken }) {
  const [outlookConnected, setOutlookConnected] = useState(false);
  const [outlookEmail, setOutlookEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Check Outlook connection status on mount
  useEffect(() => {
    if (authToken) {
      checkOutlookStatus();
    }
  }, [authToken]);

  // Check URL for Outlook callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('outlook') === 'connected') {
      const email = params.get('email');
      setOutlookConnected(true);
      setOutlookEmail(email);
      // Clean URL
      window.history.replaceState({}, document.title, '/dashboard');
    }
  }, []);

  const checkOutlookStatus = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');
      const response = await fetch('/api/email/outlook/status', {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'X-User-Id': userId,
          'X-User-Email': userEmail,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      setOutlookConnected(data.connected);
      setOutlookEmail(data.email);
    } catch (error) {
      console.error('Failed to check Outlook status:', error);
    }
  };

  const isValidRedirectUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');
      const response = await fetch('/api/email/outlook/auth-url', {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'X-User-Id': userId,
          'X-User-Email': userEmail,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      if (isValidRedirectUrl(data.authUrl)) {
        window.location.href = data.authUrl;
      } else {
        alert('Invalid authentication URL received');
      }
    } catch (error) {
      console.error('Failed to get auth URL:', error);
      alert('Failed to connect Outlook');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');
      const response = await fetch('/api/email/outlook/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
          'X-User-Id': userId,
          'X-User-Email': userEmail,
        },
        body: JSON.stringify({ daysBack: 30 }),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      alert('Outlook sync started! Emails will be imported in the background.');
    } catch (error) {
      console.error('Sync error:', error);
      alert('Failed to start sync');
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect Outlook? You can reconnect anytime.')) return;

    try {
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');
      const response = await fetch('/api/email/outlook/disconnect', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'X-User-Id': userId,
          'X-User-Email': userEmail,
        },
      });
      if (response.ok) {
        setOutlookConnected(false);
        setOutlookEmail('');
      }
    } catch (error) {
      console.error('Disconnect error:', error);
      alert('Failed to disconnect Outlook');
    }
  };

  return (
    <div className="bg-white/50 backdrop-blur border border-e2e8f0 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Mail className="w-6 h-6 text-blue-400" />
          <div>
            <h3 className="text-lg font-semibold text-white">Outlook Integration</h3>
            <p className="text-475569 text-sm">Automatically sync emails from Outlook/Microsoft 365</p>
          </div>
        </div>
      </div>

      <div className="border-t border-e2e8f0 pt-4 mt-4">
        {outlookConnected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-green-300 font-medium">Connected</p>
                <p className="text-green-200 text-sm">{outlookEmail}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleManualSync}
                disabled={syncing}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg transition text-sm"
              >
                {syncing ? 'Syncing...' : 'Sync Now'}
              </button>
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-f1f5f9 hover:bg-slate-600 text-white rounded-lg transition text-sm flex items-center justify-center gap-2"
              >
                <Unlink className="w-4 h-4" />
                Disconnect
              </button>
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-300 text-sm">
              <p>✓ Emails from the last 30 days will be automatically imported.</p>
              <p>✓ New emails will be analyzed as they arrive.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-475569 text-sm">
              Connect your Outlook account to automatically sync and analyze incoming emails for scams.
            </p>

            <button
              onClick={handleConnect}
              disabled={loading}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg transition font-medium flex items-center justify-center gap-2"
            >
              <LinkIcon className="w-4 h-4" />
              {loading ? 'Redirecting to Microsoft...' : 'Connect Outlook'}
            </button>

            <div className="p-4 bg-f1f5f9/50 border border-cbd5e1 rounded-lg">
              <p className="text-475569 text-sm mb-2 font-medium">What we access:</p>
              <ul className="text-475569 text-sm space-y-1">
                <li>• Read emails from your inbox</li>
                <li>• Analyze sender, subject, and content</li>
                <li>• Store scam scores in NexusGuard</li>
                <li>• No modification to your emails</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
