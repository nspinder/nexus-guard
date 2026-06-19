import { Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import PhoneValidator from './PhoneValidator';

export default function PhoneValidatorPage({ authToken }) {
  const { authToken: token } = useAuth();
  const currentToken = authToken || token;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Phone className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-slate-900">Phone Validator</h1>
        </div>
        <p className="text-slate-600">Analyze phone numbers for spam and fraud indicators</p>
      </div>

      <PhoneValidator authToken={currentToken} />
    </div>
  );
}
