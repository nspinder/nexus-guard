import { useState, useEffect } from 'react';
import { Bell, CheckCircle } from 'lucide-react';
import { requestNotificationPermission, subscribeToNotifications } from '../services/notifications';

export default function NotificationSettings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  const handleEnableNotifications = async () => {
    setLoading(true);
    try {
      const granted = await subscribeToNotifications();
      if (granted) {
        setNotificationsEnabled(true);
        setPermissionStatus('granted');
        localStorage.setItem('notificationsEnabled', 'true');
      } else {
        setPermissionStatus('denied');
      }
    } catch (error) {
      console.error('Notification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisableNotifications = () => {
    setNotificationsEnabled(false);
    setPermissionStatus('denied');
    localStorage.setItem('notificationsEnabled', 'false');
  };

  return (
    <div className="bg-white/50 backdrop-blur border border-e2e8f0 rounded-lg p-6 space-y-4">
      <div className="flex items-start gap-3">
        <Bell className="w-6 h-6 text-blue-400 mt-1" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">Browser Notifications</h3>
          <p className="text-475569 text-sm">
            Get instant alerts when potential scams are detected
          </p>
        </div>
      </div>

      <div className="border-t border-e2e8f0 pt-4">
        {notificationsEnabled ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-300">Notifications enabled</span>
            </div>

            <p className="text-475569 text-sm">
              You'll receive notifications when emails or calls are detected as potential scams.
            </p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-f1f5f9/30 border border-cbd5e1 rounded">
                <p className="text-475569 mb-1">High Risk (&gt;80%)</p>
                <p className="text-475569">Requires action</p>
              </div>
              <div className="p-3 bg-f1f5f9/30 border border-cbd5e1 rounded">
                <p className="text-475569 mb-1">Medium Risk (50-80%)</p>
                <p className="text-475569">Regular notification</p>
              </div>
            </div>

            <button
              onClick={handleDisableNotifications}
              className="w-full px-4 py-2 text-475569 hover:text-white hover:bg-f1f5f9 rounded-lg transition text-sm"
            >
              Disable Notifications
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-475569 text-sm">
              Enable browser notifications to receive instant alerts when scams are detected.
            </p>

            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-blue-300 text-sm mb-2">What you'll get:</p>
              <ul className="text-blue-200 text-sm space-y-1">
                <li>✓ Real-time scam alerts</li>
                <li>✓ Sender/phone number info</li>
                <li>✓ Scam probability score</li>
                <li>✓ Quick action buttons</li>
              </ul>
            </div>

            <button
              onClick={handleEnableNotifications}
              disabled={loading}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg transition font-medium text-sm"
            >
              {loading ? 'Setting up...' : 'Enable Notifications'}
            </button>

            {permissionStatus === 'denied' && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-300 text-sm">
                <p className="font-medium mb-1">Notifications blocked</p>
                <p>You'll need to enable notifications in your browser settings.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
