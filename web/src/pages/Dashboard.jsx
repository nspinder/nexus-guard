import { useState, useEffect } from 'react';
import { Mail, Phone, AlertCircle, Shield, TrendingUp, Activity, MessageCircle, MessageSquare, PhoneOff } from 'lucide-react';
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
    whatsappAnalyzed: 0,
    imessageAnalyzed: 0,
    phoneNumbersScanned: 0,
    suspiciousNumbers: 0,
    highRiskAlerts: 0,
  });
  const [riskSummary, setRiskSummary] = useState({
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  });
  const [recentAlerts, setRecentAlerts] = useState([]);

  // Sync user on mount and fetch all stats
  useEffect(() => {
    const fetchAllStats = async () => {
      if (!currentToken || !currentUser?.id) return;

      try {
        // Sync user
        await apiClient.post('/auth/sync', {}).catch(console.error);

        // Fetch user stats (emails and calls)
        const meData = await apiClient.get('/auth/me').catch(console.error);
        if (meData?.stats) {
          setStats(prev => ({
            ...prev,
            emailsAnalyzed: meData.stats.emailsAnalyzed || 0,
            callsAnalyzed: meData.stats.callsAnalyzed || 0,
            highRiskAlerts: alerts.length,
          }));
        }

        // Fetch WhatsApp messages
        const whatsappData = await apiClient.get('/whatsapp/history?limit=1000&offset=0').catch(console.error);
        if (whatsappData?.total !== undefined) {
          setStats(prev => ({
            ...prev,
            whatsappAnalyzed: whatsappData.total || 0,
          }));

          // Calculate risk distribution for WhatsApp
          if (whatsappData.messages) {
            updateRiskSummary(whatsappData.messages);
          }
        }

        // Fetch iMessage messages
        const imessageData = await apiClient.get('/imessage/history?limit=1000&offset=0').catch(console.error);
        if (imessageData?.total !== undefined) {
          setStats(prev => ({
            ...prev,
            imessageAnalyzed: imessageData.total || 0,
          }));

          // Add iMessage messages to risk calculation
          if (imessageData.messages) {
            updateRiskSummary(imessageData.messages);
          }
        }

        // Fetch email history for risk distribution
        const emailData = await apiClient.get('/email/history?limit=1000&offset=0').catch(console.error);
        if (emailData?.emails) {
          updateRiskSummary(emailData.emails);
        }

        // Fetch call history for risk distribution
        const callData = await apiClient.get('/call/history?limit=1000&offset=0').catch(console.error);
        if (callData?.calls) {
          updateRiskSummary(callData.calls);
        }

        // Fetch phone validation history
        const phoneData = await apiClient.get('/phone/history?limit=1000&offset=0').catch(console.error);
        if (phoneData?.data && Array.isArray(phoneData.data)) {
          const suspiciousCount = phoneData.data.filter(p => p.isSpam || p.riskLevel === 'high' || p.riskLevel === 'critical').length;
          setStats(prev => ({
            ...prev,
            phoneNumbersScanned: phoneData.total || phoneData.data.length,
            suspiciousNumbers: suspiciousCount,
          }));
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      }
    };

    fetchAllStats();
  }, [currentToken, currentUser?.id]);

  const updateRiskSummary = (messages) => {
    const summary = { critical: 0, high: 0, medium: 0, low: 0 };

    messages.forEach(msg => {
      const score = msg.scamScore || 0;
      if (score > 85) summary.critical++;
      else if (score > 70) summary.high++;
      else if (score > 50) summary.medium++;
      else summary.low++;
    });

    setRiskSummary(prev => ({
      critical: prev.critical + summary.critical,
      high: prev.high + summary.high,
      medium: prev.medium + summary.medium,
      low: prev.low + summary.low,
    }));
  };

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

  const totalAnalyzed = stats.emailsAnalyzed + stats.callsAnalyzed + stats.whatsappAnalyzed + stats.imessageAnalyzed + stats.phoneNumbersScanned;
  const totalRiskItems = riskSummary.critical + riskSummary.high + riskSummary.medium + riskSummary.low;

  // Calculate average risk score based on risk distribution
  const avgRiskScore = totalRiskItems > 0
    ? Math.round(
        (riskSummary.critical * 90 +  // Critical (85+) use 90 as midpoint
         riskSummary.high * 77.5 +    // High (70-85) use 77.5 as midpoint
         riskSummary.medium * 60 +    // Medium (50-70) use 60 as midpoint
         riskSummary.low * 25) /      // Low (<50) use 25 as midpoint
        totalRiskItems
      )
    : 0;
  const suspiciousPhonePercentage = stats.phoneNumbersScanned > 0
    ? Math.round((stats.suspiciousNumbers / stats.phoneNumbersScanned) * 100)
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-10">
        {/* Total Analyzed */}
        <div className="bg-white border border-e2e8f0 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-600 text-xs font-medium">Total</p>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalAnalyzed}</p>
          <p className="text-xs text-slate-500 mt-1">All analyzed</p>
        </div>

        {/* Emails Analyzed */}
        <div className="bg-white border border-e2e8f0 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-600 text-xs font-medium">Emails</p>
            <Mail className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.emailsAnalyzed}</p>
          <p className="text-xs text-slate-500 mt-1">Email checks</p>
        </div>

        {/* Calls Analyzed */}
        <div className="bg-white border border-e2e8f0 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-600 text-xs font-medium">Calls</p>
            <Phone className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.callsAnalyzed}</p>
          <p className="text-xs text-slate-500 mt-1">Call checks</p>
        </div>

        {/* WhatsApp Messages */}
        <div className="bg-white border border-e2e8f0 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-600 text-xs font-medium">WhatsApp</p>
            <MessageCircle className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.whatsappAnalyzed}</p>
          <p className="text-xs text-slate-500 mt-1">Messages</p>
        </div>

        {/* iMessage Messages */}
        <div className="bg-white border border-e2e8f0 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-600 text-xs font-medium">iMessage</p>
            <MessageSquare className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.imessageAnalyzed}</p>
          <p className="text-xs text-slate-500 mt-1">Messages</p>
        </div>

        {/* Phone Numbers Scanned */}
        <div className="bg-white border border-e2e8f0 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-600 text-xs font-medium">Phone #s</p>
            <Phone className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.phoneNumbersScanned}</p>
          <p className="text-xs text-slate-500 mt-1">Scanned</p>
        </div>

        {/* Suspicious Numbers Found */}
        <div className={`rounded-lg p-4 shadow-sm ${stats.suspiciousNumbers > 0 ? 'bg-red-50 border border-red-200' : 'bg-white border border-e2e8f0'}`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-600 text-xs font-medium">Suspicious</p>
            <PhoneOff className={`w-4 h-4 ${stats.suspiciousNumbers > 0 ? 'text-red-500' : 'text-green-500'}`} />
          </div>
          <p className={`text-2xl font-bold ${stats.suspiciousNumbers > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {suspiciousPhonePercentage}%
          </p>
          <p className="text-xs text-slate-500 mt-1">{stats.suspiciousNumbers} of {stats.phoneNumbersScanned}</p>
        </div>
      </div>

      {/* Risk Score Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Risk Distribution */}
        <div className="bg-white border border-e2e8f0 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-slate-900">Risk Score Distribution</h3>
          </div>

          {totalRiskItems > 0 ? (
            <div className="space-y-4">
              {/* Critical */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                    <span className="text-sm font-medium text-slate-600">Critical (85+)</span>
                  </div>
                  <span className="text-sm font-bold text-red-600">{riskSummary.critical}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full"
                    style={{ width: `${(riskSummary.critical / totalRiskItems) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* High */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm font-medium text-slate-600">High (70-85)</span>
                  </div>
                  <span className="text-sm font-bold text-orange-500">{riskSummary.high}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${(riskSummary.high / totalRiskItems) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Medium */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-medium text-slate-600">Medium (50-70)</span>
                  </div>
                  <span className="text-sm font-bold text-yellow-600">{riskSummary.medium}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${(riskSummary.medium / totalRiskItems) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Low */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-slate-600">Low (&lt;50)</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">{riskSummary.low}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(riskSummary.low / totalRiskItems) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-2 border-t border-e2e8f0">
                <p className="text-xs text-slate-500">
                  Total analyzed: {totalRiskItems} messages
                </p>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No messages analyzed yet</p>
          )}
        </div>

        {/* Average Risk Score & Subscription */}
        <div className="space-y-6">
          {/* Average Risk Score */}
          <div className="bg-white border border-e2e8f0 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-slate-900">Average Risk Score</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{avgRiskScore}%</p>
            <p className="text-xs text-slate-500 mt-2">
              {alerts.length === 0
                ? 'No high-risk alerts'
                : `Based on ${alerts.length} threat${alerts.length > 1 ? 's' : ''}`}
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
