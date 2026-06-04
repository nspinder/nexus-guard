import { useState } from 'react';
import { Mail, AlertTriangle, CheckCircle } from 'lucide-react';
import axios from 'axios';

export default function EmailAnalyzer({ onAlert }) {
  const [formData, setFormData] = useState({
    sender: '',
    subject: '',
    bodyPreview: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const userId = localStorage.getItem('userId');
      const response = await axios.post('/api/email/analyze', formData, {
        headers: {
          'X-User-Id': userId,
        },
      });

      setResult(response.data);
      if (response.data.analysis.probability > 70) {
        onAlert({
          type: 'email',
          sender: formData.sender,
          probability: response.data.analysis.probability,
          timestamp: new Date(),
        });
      }

      setFormData({ sender: '', subject: '', bodyPreview: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <Mail className="w-6 h-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">Email Scam Analyzer</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            From (Sender Email)
          </label>
          <input
            type="email"
            name="sender"
            value={formData.sender}
            onChange={handleChange}
            placeholder="sender@example.com"
            required
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Subject
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Email subject line"
            required
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Email Body Preview
          </label>
          <textarea
            name="bodyPreview"
            value={formData.bodyPreview}
            onChange={handleChange}
            placeholder="Paste the email content here..."
            required
            rows="6"
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-medium rounded-lg transition"
        >
          {loading ? 'Analyzing...' : 'Analyze Email'}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 mb-6">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="border-t border-slate-700 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Analysis Result</h3>

            {/* Scam Score */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-2">Scam Probability</p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-bold ${
                    result.analysis.probability > 70 ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {result.analysis.probability}%
                  </span>
                </div>
              </div>

              <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-2">Risk Level</p>
                <div className={`text-2xl font-bold ${
                  result.analysis.risk === 'high' ? 'text-red-400' :
                  result.analysis.risk === 'medium' ? 'text-yellow-400' :
                  'text-green-400'
                }`}>
                  {result.analysis.risk.charAt(0).toUpperCase() + result.analysis.risk.slice(1)}
                </div>
              </div>
            </div>

            {/* Red Flags */}
            {result.analysis.flags && result.analysis.flags.length > 0 && (
              <div className="mb-6">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  Red Flags Detected
                </h4>
                <ul className="space-y-2">
                  {result.analysis.flags.map((flag, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-300 text-sm">
                      <span className="text-red-400 mt-1">•</span>
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reasoning */}
            <div>
              <h4 className="text-white font-medium mb-2">Analysis Details</h4>
              <p className="text-slate-300 text-sm">{result.analysis.reasoning}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
