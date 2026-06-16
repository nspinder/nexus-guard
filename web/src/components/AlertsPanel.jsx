import { AlertCircle, Mail, Phone } from 'lucide-react';

export default function AlertsPanel({ alerts }) {
  if (alerts.length === 0) {
    return (
      <div className="bg-white border border-e2e8f0 rounded-lg p-12 text-center shadow-sm">
        <AlertCircle className="w-12 h-12 text-cbd5e1 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-1e293b mb-2">No Scam Alerts</h2>
        <p className="text-475569">
          You're all clear! Analyze emails and calls to detect potential scams.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-e2e8f0 rounded-lg p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-1e293b mb-6">Recent Alerts</h2>

      <div className="space-y-4">
        {alerts.map((alert, idx) => (
          <div
            key={idx}
            className="bg-fef2f2 border border-red-300 rounded-lg p-6 flex items-start gap-4"
          >
            <div className="mt-1">
              {alert.type === 'email' ? (
                <Mail className="w-6 h-6 text-ef4444" />
              ) : (
                <Phone className="w-6 h-6 text-ef4444" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-1e293b">
                  {alert.type === 'email' ? 'Email' : 'Call'} Alert
                </h3>
                <span className={`text-sm font-bold ${
                  alert.probability > 75 ? 'text-ef4444' : 'text-f97316'
                }`}>
                  {alert.probability}% likely scam
                </span>
              </div>

              <p className="text-475569 mb-2">
                {alert.type === 'email' ? `From: ${alert.sender}` : `Phone: ${alert.phoneNumber}`}
              </p>

              <p className="text-94a3b8 text-sm">
                {new Date(alert.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
