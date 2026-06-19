import { Mail, History } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import EmailHistory from '../components/EmailHistory';

export default function EmailHistoryPage({ user, authToken }) {
  const { authToken: token } = useAuth();
  const currentToken = authToken || token;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <History className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-slate-900">Email History</h1>
        </div>
        <p className="text-slate-600">View all analyzed emails and their results</p>
      </div>

      <EmailHistory authToken={currentToken} />
    </div>
  );
}
