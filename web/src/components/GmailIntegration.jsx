import { useState, useEffect } from 'react';
import { Mail, Check, Link as LinkIcon, Unlink } from 'lucide-react';

export default function GmailIntegration({ authToken }) {
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailEmail, setGmailEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Check Gmail connection status on mount
  useEffect(() => {
    if (authToken) {
      checkGmailStatus();
    }
  }, [authToken]);

  // Check URL for Gmail callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('gmail') === 'connected') {
      const email = params.get('email');
      setGmailConnected(true);
      setGmailEmail(email);
      // Clean URL
      window.history.replaceState({}, document.title, '/dashboard');
    }
  }, []);

  const checkGmailStatus = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');
      const response = await fetch('/api/email/gmail/status', {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'X-User-Id': userId,
          'X-User-Email': userEmail,
        },
      });
      const data = await response.json();
      setGmailConnected(data.connected);
      setGmailEmail(data.email);
    } catch (error) {
      console.error('Failed to check Gmail status:', error);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');
      const response = await fetch('/api/email/gmail/auth-url', {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'X-User-Id': userId,
          'X-User-Email': userEmail,
        },
      });
      const data = await response.json();
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Failed to get auth URL:', error);
      alert('Failed to connect Gmail');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');
      const response = await fetch('/api/email/gmail/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
          'X-User-Id': userId,
          'X-User-Email': userEmail,
        },
        body: JSON.stringify({ daysBack: 30 }),
      });
      const data = await response.json();
      alert('Gmail sync started! Emails will be imported in the background.');
    } catch (error) {
      console.error('Sync error:', error);
      alert('Failed to start sync');
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect Gmail? You can reconnect anytime.')) return;

    try {
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');
      const response = await fetch('/api/email/gmail/disconnect', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'X-User-Id': userId,
          'X-User-Email': userEmail,
        },
      });
      if (response.ok) {
        setGmailConnected(false);
        setGmailEmail('');
      }
    } catch (error) {
      console.error('Disconnect error:', error);
      alert('Failed to disconnect Gmail');
    }
  };

  return (
    <div className="bg-white/50 backdrop-blur border border-e2e8f0 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Mail className="w-6 h-6 text-blue-400" />
          <div>
            <h3 className="text-lg font-semibold text-white">Gmail Integration</h3>
            <p className="text-475569 text-sm">Automatically sync emails from Gmail</p>
          </div>
        </div>
      </div>

      <div className="border-t border-e2e8f0 pt-4 mt-4">
        {gmailConnected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-green-300 font-medium">Connected</p>
                <p className="text-green-200 text-sm">{gmailEmail}</p>
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
              Connect your Gmail account to automatically sync and analyze incoming emails for scams.
            </p>

            <button
              onClick={handleConnect}
              disabled={loading}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg transition font-medium flex items-center justify-center gap-2"
            >
              <LinkIcon className="w-4 h-4" />
              {loading ? 'Redirecting to Google...' : 'Connect Gmail'}
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
