import { useState, useEffect } from 'react';
import { Mail, Phone, AlertCircle, Shield, TrendingUp, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeAlerts } from '../hooks/useRealtimeAlerts';
import { notifyScamDetected } from '../services/notifications';
import apiClient from '../services/apiClient';

export default function Dashboard({ user, authToken }) {
  const { user: authUser, authToken: token } = useAuth();
  const currentUser = user || authUser;
  const currentToken = authToken || token;
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    emailsAnalyzed: 0,
    callsAnalyzed: 0,
    highRiskAlerts: 0,
  });
  const [recentAlerts, setRecentAlerts] = useState([]);

  // Sync user on mount
  useEffect(() => {
    if (currentToken && currentUser?.id) {
      apiClient.post('/auth/sync', {}).catch(console.error);

      // Fetch user stats
      apiClient.get('/auth/me')
        .then((data) => {
          if (data.stats) {
            setStats({
              emailsAnalyzed: data.stats.emailsAnalyzed || 0,
              callsAnalyzed: data.stats.callsAnalyzed || 0,
              highRiskAlerts: alerts.length,
            });
          }
        })
        .catch(console.error);
    }
  }, [currentToken, currentUser?.id, alerts.length]);

  const handleNewAlert = (alert) => {
    setAlerts([alert, ...alerts]);
    setRecentAlerts([alert, ...recentAlerts.slice(0, 4)]);
  };

  // Listen for real-time alerts from server
  useRealtimeAlerts(currentUser?.id, (scamData) => {
    const newAlert = {
      type: scamData.type,
      sender: scamData.sender,
      phoneNumber: scamData.phoneNumber,
      probability: scamData.probability,
      timestamp: new Date(),
    };
    handleNewAlert(newAlert);
    notifyScamDetected(scamData);
  });

  const totalAnalyzed = stats.emailsAnalyzed + stats.callsAnalyzed;
  const avgRiskScore = alerts.length > 0
    ? Math.round(alerts.reduce((sum, alert) => sum + alert.probability, 0) / alerts.length)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        </div>
        <p className="text-slate-600">Overview of your security analysis activity</p>
      </div>

      {/* Summary Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Total Analyzed */}
        <div className="bg-white border border-e2e8f0 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-600 text-sm font-medium">Total Analyzed</p>
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{totalAnalyzed}</p>
          <p className="text-xs text-slate-500 mt-2">
            {stats.emailsAnalyzed} emails + {stats.callsAnalyzed} calls
          </p>
        </div>

        {/* Emails Analyzed */}
        <div className="bg-white border border-e2e8f0 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-600 text-sm font-medium">Emails Analyzed</p>
            <Mail className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.emailsAnalyzed}</p>
          <p className="text-xs text-slate-500 mt-2">Email security checks</p>
        </div>

        {/* Calls Analyzed */}
        <div className="bg-white border border-e2e8f0 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-600 text-sm font-medium">Calls Analyzed</p>
            <Phone className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.callsAnalyzed}</p>
          <p className="text-xs text-slate-500 mt-2">Phone security checks</p>
        </div>

        {/* High Risk Alerts */}
        <div className="bg-white border border-e2e8f0 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-600 text-sm font-medium">High Risk Alerts</p>
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <p className={`text-3xl font-bold ${alerts.length > 0 ? 'text-red-600' : 'text-slate-900'}`}>
            {alerts.length}
          </p>
          <p className="text-xs text-slate-500 mt-2">Detected threats</p>
        </div>
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Average Risk Score */}
        <div className="bg-white border border-e2e8f0 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-slate-900">Average Risk Score</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">{avgRiskScore}%</p>
          <p className="text-xs text-slate-500 mt-2">
            {alerts.length === 0
              ? 'No alerts to calculate'
              : `Based on ${alerts.length} detected threat${alerts.length > 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Subscription Status */}
        <div className="bg-white border border-e2e8f0 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-slate-900">Subscription</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">Free</p>
          <p className="text-xs text-slate-500 mt-2">Current plan</p>
        </div>
      </div>

      {/* Recent Alerts */}
      {recentAlerts.length > 0 && (
        <div className="bg-white border border-e2e8f0 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Recent Alerts
          </h3>
          <div className="space-y-3">
            {recentAlerts.map((alert, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-e2e8f0"
              >
                <div className="flex-shrink-0">
                  {alert.type === 'email' ? (
                    <Mail className="w-5 h-5 text-red-500" />
                  ) : (
                    <Phone className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-medium text-slate-900">
                      {alert.type === 'email' ? 'Email' : 'Call'} Alert
                    </p>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      alert.probability > 75
                        ? 'bg-red-100 text-red-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {alert.probability}%
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    {alert.type === 'email' ? `From: ${alert.sender}` : `Phone: ${alert.phoneNumber}`}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {recentAlerts.length === 0 && alerts.length === 0 && (
        <div className="bg-white border border-e2e8f0 rounded-lg p-12 text-center shadow-sm">
          <Shield className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Alerts</h3>
          <p className="text-slate-600 mb-6">
            You're all clear! Your emails and calls are being monitored for threats.
          </p>
          <p className="text-xs text-slate-500">
            Use the navigation menu to analyze emails, calls, and messages for security threats.
          </p>
        </div>
      )}
    </div>
  );
}
