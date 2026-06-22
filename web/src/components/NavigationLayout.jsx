import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, LogOut, Settings as SettingsIcon, Home, AlertCircle, Mail, Phone, MessageCircle, Link as LinkIcon, Lock, Users, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import '../App.css';

export default function NavigationLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (pathname) => location.pathname === pathname;

  return (
    <div className="app-container">
      <nav className="app-navbar">
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

            <Link
              to="/analysis-hub"
              className={`nav-item ${isActive('/analysis-hub') ? 'active' : ''}`}
              title="Analysis Hub"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Analysis Hub</span>
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

            <Link
              to="/url-scanner"
              className={`nav-item ${isActive('/url-scanner') ? 'active' : ''}`}
              title="URL Scanner"
            >
              <LinkIcon className="w-4 h-4" />
              <span>URL Scanner</span>
            </Link>

            <Link
              to="/password-checker"
              className={`nav-item ${isActive('/password-checker') ? 'active' : ''}`}
              title="Password Checker"
            >
              <Lock className="w-4 h-4" />
              <span>Password Checker</span>
            </Link>

            <Link
              to="/community-reports"
              className={`nav-item ${isActive('/community-reports') ? 'active' : ''}`}
              title="Community Reports"
            >
              <Users className="w-4 h-4" />
              <span>Community Reports</span>
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

      <main className="app-main">{children}</main>
    </div>
  );
}
