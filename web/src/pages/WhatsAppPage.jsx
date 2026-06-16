import { MessageCircle, History } from 'lucide-react';
import WhatsappHistory from '../components/WhatsappHistory';

export default function WhatsAppPage({ user, authToken }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <MessageCircle className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-slate-900">WhatsApp</h1>
        </div>
        <p className="text-slate-600">View WhatsApp message analysis history</p>
      </div>

      <WhatsappHistory authToken={authToken} />
    </div>
  );
}
