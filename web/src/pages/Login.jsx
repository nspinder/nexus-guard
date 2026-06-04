import { useState } from 'react';
import { Shield, AlertCircle } from 'lucide-react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // For MVP, use simple demo credentials
      if (email && password) {
        onLogin({
          id: 'demo-user-' + Date.now(),
          email,
        });
      } else {
        setError('Please fill in all fields');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-12 h-12 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">NexusGuard</h1>
          </div>
          <p className="text-slate-400 text-lg">
            Protect yourself from scams and phishing
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-8 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-medium rounded-lg transition duration-200"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="text-center text-sm text-slate-400">
            <p>For MVP demo, use any email and password to login</p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-3 gap-4">
          {[
            { icon: '📧', label: 'Email Shield' },
            { icon: '📞', label: 'Call Guard' },
            { icon: '🔔', label: 'Alerts' },
          ].map((feature) => (
            <div
              key={feature.label}
              className="text-center p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg"
            >
              <div className="text-2xl mb-2">{feature.icon}</div>
              <p className="text-slate-400 text-sm">{feature.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
