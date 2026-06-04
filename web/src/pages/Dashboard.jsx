import { useState } from 'react';
import { Mail, Phone, AlertCircle, Shield, Settings } from 'lucide-react';
import EmailAnalyzer from '../components/EmailAnalyzer';
import CallAnalyzer from '../components/CallAnalyzer';
import AlertsPanel from '../components/AlertsPanel';
import ConsentSettings from '../components/ConsentSettings';

export default function Dashboard({ user }) {
  const [activeTab, setActiveTab] = useState('alerts');
  const [alerts, setAlerts] = useState([]);

  const tabs = [
    { id: 'alerts', label: 'Alerts', icon: AlertCircle },
    { id: 'email', label: 'Analyze Email', icon: Mail },
    { id: 'call', label: 'Analyze Call', icon: Phone },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNewAlert = (alert) => {
    setAlerts([alert, ...alerts]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <EmailAnalyzer onAlert={handleNewAlert} />
        )}
        {activeTab === 'call' && (
          <CallAnalyzer onAlert={handleNewAlert} />
        )}
        {activeTab === 'settings' && <ConsentSettings />}
      </div>
    </div>
  );
}
