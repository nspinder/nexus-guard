import { useState, useEffect } from 'react';
import { AlertCircle, Mail, Phone, Shield, LogOut } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import './App.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (from localStorage or session)
    const userId = localStorage.getItem('userId');
    if (userId) {
      setUser({ id: userId, email: localStorage.getItem('userEmail') });
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('userId', userData.id);
    localStorage.setItem('userEmail', userData.email);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('authToken');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <div>
          <nav className="bg-slate-800/50 backdrop-blur border-b border-slate-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <Shield className="w-8 h-8 text-blue-400" />
                <h1 className="text-2xl font-bold text-white">NexusGuard</h1>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-slate-300">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </nav>

          <Dashboard user={user} />
        </div>
      )}
    </div>
  );
}
