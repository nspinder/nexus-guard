import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AlertsPanel from '../components/AlertsPanel';
import { useRealtimeAlerts } from '../hooks/useRealtimeAlerts';
import { notifyScamDetected } from '../services/notifications';

export default function AlertsPage({ user, authToken }) {
  const { user: authUser } = useAuth();
  const currentUser = user || authUser;
  const [alerts, setAlerts] = useState([]);

  const handleNewAlert = (alert) => {
    setAlerts([alert, ...alerts]);
  };

  // Listen for real-time alerts from server
  useRealtimeAlerts(currentUser?.id, (scamData) => {
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
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <AlertCircle className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-slate-900">Alerts</h1>
        </div>
        <p className="text-slate-600">Monitor detected scams and suspicious activities</p>
      </div>

      <AlertsPanel alerts={alerts} />
    </div>
  );
}
