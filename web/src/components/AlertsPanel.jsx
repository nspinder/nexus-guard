import { AlertCircle, Mail, Phone } from 'lucide-react';

export default function AlertsPanel({ alerts }) {
  if (alerts.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-12 text-center">
        <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">No Scam Alerts</h2>
        <p className="text-slate-400">
          You're all clear! Analyze emails and calls to detect potential scams.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Recent Alerts</h2>

      <div className="space-y-4">
        {alerts.map((alert, idx) => (
          <div
            key={idx}
            className="bg-slate-700/50 border border-red-500/30 rounded-lg p-6 flex items-start gap-4"
          >
            <div className="mt-1">
              {alert.type === 'email' ? (
                <Mail className="w-6 h-6 text-red-400" />
              ) : (
                <Phone className="w-6 h-6 text-red-400" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-white">
                  {alert.type === 'email' ? 'Email' : 'Call'} Alert
                </h3>
                <span className={`text-sm font-bold ${
                  alert.probability > 75 ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {alert.probability}% likely scam
                </span>
              </div>

              <p className="text-slate-300 mb-2">
                {alert.type === 'email' ? `From: ${alert.sender}` : `Phone: ${alert.phoneNumber}`}
              </p>

              <p className="text-slate-500 text-sm">
                {new Date(alert.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
