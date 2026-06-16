import { useState, useEffect } from 'react';
import { Phone, Trash2 } from 'lucide-react';

export default function CallHistory({ authToken }) {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchCalls();
  }, [authToken]);

  const fetchCalls = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');
      const response = await fetch('/api/call/history?limit=100', {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'X-User-Id': userId,
          'X-User-Email': userEmail,
        },
      });
      const data = await response.json();
      setCalls(data.calls || []);
    } catch (error) {
      console.error('Failed to fetch call history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (callId) => {
    if (!window.confirm('Delete this call record?')) return;

    setDeleting(callId);
    try {
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');
      const response = await fetch(`/api/call/${callId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'X-User-Id': userId,
          'X-User-Email': userEmail,
        },
      });

      if (response.ok) {
        setCalls(calls.filter(c => c.id !== callId));
      }
    } catch (error) {
      console.error('Failed to delete call:', error);
      alert('Failed to delete call');
    } finally {
      setDeleting(null);
    }
  };

  const getRiskColor = (score) => {
    if (score > 85) return 'text-red-400';
    if (score > 70) return 'text-orange-400';
    return 'text-green-400';
  };

  const getRiskBgColor = (score) => {
    if (score > 85) return 'bg-red-500/10 border-red-500/20';
    if (score > 70) return 'bg-orange-500/10 border-orange-500/20';
    return 'bg-green-500/10 border-green-500/20';
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-475569">Loading calls...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Call History</h2>
        <p className="text-475569">{calls.length} calls analyzed</p>
      </div>

      {calls.length === 0 ? (
        <div className="bg-white/50 border border-e2e8f0 rounded-lg p-8 text-center">
          <Phone className="w-12 h-12 text-94a3b8 mx-auto mb-4" />
          <p className="text-475569">No calls analyzed yet. Analyze calls to see history.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {calls.map((call) => (
            <div
              key={call.id}
              className={`border rounded-lg p-4 ${getRiskBgColor(call.scamScore)} border`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {call.phoneNumber || call.callerId || 'Unknown'}
                  </p>
                  <p className="text-475569 text-sm">
                    Duration: {formatDuration(call.callDurationSeconds || 0)}
                  </p>
                  <p className="text-475569 text-xs mt-1">
                    {new Date(call.createdAt).toLocaleDateString()} at{' '}
                    {new Date(call.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <div className="text-right">
                    <p className={`text-lg font-bold ${getRiskColor(call.scamScore)}`}>
                      {call.scamScore}%
                    </p>
                    <p className="text-xs text-475569">
                      {call.scamScore > 85
                        ? 'Critical'
                        : call.scamScore > 70
                        ? 'High'
                        : 'Low'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(call.id)}
                    disabled={deleting === call.id}
                    className="p-2 hover:bg-f1f5f9 rounded-lg transition disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-475569 hover:text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
