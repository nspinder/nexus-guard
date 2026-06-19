import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, LogOut, Settings as SettingsIcon, Home, AlertCircle, Mail, Phone, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import '../App.css';

export default function NavigationLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  console.log('NavigationLayout rendering. User:', user);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (pathname) => location.pathname === pathname;

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', flexDirection: 'row' }}>
      <nav style={{ width: '260px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRight: '1px solid rgba(255, 255, 255, 0.1)', overflowY: 'auto', flexShrink: 0, height: '100vh', zIndex: 50 }}>
        <div className="nav-container">
          <div className="nav-brand">
            <Shield className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">NexusGuard</h1>
          </div>

          <div className="nav-menu">
            <Link
              to="/home"
              className={`nav-item ${isActive('/home') ? 'active' : ''}`}
              title="Home"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>

            <Link
              to="/dashboard"
              className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
              title="Dashboard"
            >
              <Shield className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            <div className="nav-divider"></div>

            <Link
              to="/alerts"
              className={`nav-item ${isActive('/alerts') ? 'active' : ''}`}
              title="Alerts"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Alerts</span>
            </Link>

            <Link
              to="/analyze-email"
              className={`nav-item ${isActive('/analyze-email') ? 'active' : ''}`}
              title="Analyze Email"
            >
              <Mail className="w-4 h-4" />
              <span>Analyze Email</span>
            </Link>

            <Link
              to="/analyze-call"
              className={`nav-item ${isActive('/analyze-call') ? 'active' : ''}`}
              title="Analyze Call"
            >
              <Phone className="w-4 h-4" />
              <span>Analyze Call</span>
            </Link>

            <Link
              to="/phone-validator"
              className={`nav-item ${isActive('/phone-validator') ? 'active' : ''}`}
              title="Phone Validator"
            >
              <Phone className="w-4 h-4" />
              <span>Phone Validator</span>
            </Link>

            <Link
              to="/email-history"
              className={`nav-item ${isActive('/email-history') ? 'active' : ''}`}
              title="Email History"
            >
              <Mail className="w-4 h-4" />
              <span>Email History</span>
            </Link>

            <Link
              to="/call-history"
              className={`nav-item ${isActive('/call-history') ? 'active' : ''}`}
              title="Call History"
            >
              <Phone className="w-4 h-4" />
              <span>Call History</span>
            </Link>

            <Link
              to="/whatsapp"
              className={`nav-item ${isActive('/whatsapp') ? 'active' : ''}`}
              title="WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </Link>

            <Link
              to="/imessage"
              className={`nav-item ${isActive('/imessage') ? 'active' : ''}`}
              title="iMessage"
            >
              <MessageCircle className="w-4 h-4" />
              <span>iMessage</span>
            </Link>

            <div className="nav-divider"></div>

            <Link
              to="/settings"
              className={`nav-item ${isActive('/settings') ? 'active' : ''}`}
              title="Settings"
            >
              <SettingsIcon className="w-4 h-4" />
              <span>Settings</span>
            </Link>

            <span className="text-slate-400 text-sm px-4">{user?.email}</span>

            <button
              onClick={handleLogout}
              className="nav-item logout"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <main style={{ flex: 1, overflowY: 'auto', background: '#ffffff', width: '100%' }}>{children}</main>
    </div>
  );
}
