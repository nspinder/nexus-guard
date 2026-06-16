import { Phone } from 'lucide-react';
import { useState } from 'react';
import CallAnalyzer from '../components/CallAnalyzer';

export default function AnalyzeCallPage({ user, authToken }) {
  const [alerts, setAlerts] = useState([]);

  const handleNewAlert = (alert) => {
    setAlerts([alert, ...alerts]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Phone className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-slate-900">Analyze Call</h1>
        </div>
        <p className="text-slate-600">Analyze phone calls for potential scams and fraud</p>
      </div>

      <CallAnalyzer onAlert={handleNewAlert} authToken={authToken} />
    </div>
  );
}
