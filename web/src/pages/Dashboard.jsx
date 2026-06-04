import { useState, useEffect } from 'react';
import { Mail, Phone, AlertCircle, Shield, Settings } from 'lucide-react';
import EmailAnalyzer from '../components/EmailAnalyzer';
import CallAnalyzer from '../components/CallAnalyzer';
import AlertsPanel from '../components/AlertsPanel';
import ConsentSettings from '../components/ConsentSettings';
import { useRealtimeAlerts } from '../hooks/useRealtimeAlerts';
import { notifyScamDetected } from '../services/notifications';

export default function Dashboard({ user, authToken }) {
  const [activeTab, setActiveTab] = useState('alerts');
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({ emailsAnalyzed: 0, callsAnalyzed: 0 });

  // Sync user on mount
  useEffect(() => {
    if (authToken) {
      fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      }).catch(console.error);

      // Fetch user stats
      fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.stats) {
            setStats(data.stats);
          }
        })
        .catch(console.error);
    }
  }, [authToken]);

  const tabs = [
    { id: 'alerts', label: 'Alerts', icon: AlertCircle },
    { id: 'email', label: 'Analyze Email', icon: Mail },
    { id: 'call', label: 'Analyze Call', icon: Phone },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNewAlert = (alert) => {
    setAlerts([alert, ...alerts]);
  };

  // Listen for real-time alerts from server
  useRealtimeAlerts(user?.id, (scamData) => {
    // Add to local alerts
    handleNewAlert({
      type: scamData.type,
      sender: scamData.sender,
      phoneNumber: scamData.phoneNumber,
      probability: scamData.probability,
      timestamp: new Date(),
    });

    // Send browser notification
    notifyScamDetected(scamData);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <p className="text-slate-400 text-sm">Emails Analyzed</p>
          <p className="text-2xl font-bold text-white">{stats.emailsAnalyzed}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <p className="text-slate-400 text-sm">Calls Analyzed</p>
          <p className="text-2xl font-bold text-white">{stats.callsAnalyzed}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <p className="text-slate-400 text-sm">High Risk Alerts</p>
          <p className="text-2xl font-bold text-red-400">{alerts.length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <p className="text-slate-400 text-sm">Subscription</p>
          <p className="text-2xl font-bold text-blue-400">Free</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-8 border-b border-slate-700">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition ${
                isActive
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'alerts' && <AlertsPanel alerts={alerts} />}
        {activeTab === 'email' && (
          <EmailAnalyzer onAlert={handleNewAlert} authToken={authToken} />
        )}
        {activeTab === 'call' && (
          <CallAnalyzer onAlert={handleNewAlert} authToken={authToken} />
        )}
        {activeTab === 'settings' && <ConsentSettings authToken={authToken} />}
      </div>
    </div>
  );
}
