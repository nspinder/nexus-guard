import { useState } from 'react';
import { Shield, AlertCircle, Lock, Mail, Zap, Phone, Bell } from 'lucide-react';

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
      if (!email || !password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      const token = btoa(`${email}:${password}`);
      onLogin({
        id: `user-${Date.now()}`,
        email,
      }, token);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Features */}
          <div className="hidden lg:block space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-10 h-10 text-blue-400" />
                <h1 className="text-5xl font-bold text-white">NexusGuard</h1>
              </div>
              <p className="text-xl text-slate-300 mb-8">
                AI-powered scam detection for emails and calls
              </p>
            </div>

            {/* Feature cards */}
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition">
                <Mail className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-white mb-1">Email Shield</h3>
                  <p className="text-sm text-slate-300">Analyze emails for phishing and scams</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition">
                <Phone className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-white mb-1">Call Guard</h3>
                  <p className="text-sm text-slate-300">Detect suspicious phone calls in real-time</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition">
                <Bell className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-white mb-1">Instant Alerts</h3>
                  <p className="text-sm text-slate-300">Get notified immediately when threats detected</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition">
                <Zap className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-white mb-1">Powered by AI</h3>
                  <p className="text-sm text-slate-300">Uses Claude API for intelligent analysis</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Login Form */}
          <div className="w-full">
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl space-y-6">
              {/* Mobile Header */}
              <div className="lg:hidden text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Shield className="w-10 h-10 text-blue-400" />
                  <h1 className="text-3xl font-bold text-white">NexusGuard</h1>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 animate-pulse">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/20"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Logging in...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Sign In
                    </>
                  )}
                </button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-800/40 text-slate-400">Test Login</span>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-sm text-blue-200 text-center">
                  Use any email and password to create a test account
                </p>
              </div>

              {/* Social proof */}
              <div className="pt-4 border-t border-slate-700/50">
                <p className="text-xs text-slate-400 text-center mb-3">
                  Trusted by security-conscious users
                </p>
                <div className="flex items-center justify-center gap-6 text-slate-400">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">100%</div>
                    <div className="text-xs">Secure</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">24/7</div>
                    <div className="text-xs">Protection</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">AI</div>
                    <div className="text-xs">Powered</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
