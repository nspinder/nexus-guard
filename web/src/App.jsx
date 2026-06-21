import { useState, useEffect } from 'react';
import { Shield, LogOut, Settings as SettingsIcon, Link, Phone, Lock, Users, Mic, Home, BookOpen, HelpCircle, AlertCircle, Mail, MessageCircle } from 'lucide-react';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import HomePage from './pages/Home';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import URLScanner from './pages/URLScanner';
import PhoneValidator from './pages/PhoneValidator';
import PasswordChecker from './pages/PasswordChecker';
import CommunityReports from './pages/CommunityReports';
import VoiceAnalyzer from './pages/VoiceAnalyzer';
import WhereToStart from './pages/WhereToStart';
import HowTo from './pages/HowTo';
import SecurityTips from './pages/SecurityTips';
import StartTour from './pages/StartTour';
import GetHelp from './pages/GetHelp';
import BrowserExtension from './pages/BrowserExtension';
import AlertsPage from './pages/AlertsPage';
import AnalyzeEmailPage from './pages/AnalyzeEmailPage';
import AnalyzeCallPage from './pages/AnalyzeCallPage';
import EmailHistoryPage from './pages/EmailHistoryPage';
import CallHistoryPage from './pages/CallHistoryPage';
import WhatsAppPage from './pages/WhatsAppPage';
import IMessagePage from './pages/IMessagePage';
import PhoneValidatorPage from './pages/PhoneValidatorPage';
import './App.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail');
    const token = localStorage.getItem('authToken');

    if (userId && userEmail && token) {
      setUser({ id: userId, email: userEmail });
      setAuthToken(token);
      setCurrentPage('home');
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    setUser(userData);
    setAuthToken(token);
    localStorage.setItem('userId', userData.id);
    localStorage.setItem('userEmail', userData.email);
    localStorage.setItem('authToken', token);
    setShowLoginModal(false);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('authToken');
    setCurrentPage('home');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Not logged in - show landing page
  if (!user) {
    return (
      <>
        <LandingPage
          onNavigate={setCurrentPage}
          onLogin={() => setShowLoginModal(true)}
        />
        {showLoginModal && (
          <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <Login onLogin={handleLogin} />
            </div>
          </div>
        )}
      </>
    );
  }

  // Logged in - show dashboard
  return (
    <div className="app-container">
      <nav className="app-navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <Shield className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">NexusGuard</h1>
          </div>

          <div className="nav-menu">
            <button
              onClick={() => setCurrentPage('home')}
              className={`nav-item ${currentPage === 'home' ? 'active' : ''}`}
              title="Home"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
              title="Dashboard"
            >
              <Shield className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <div className="nav-divider"></div>

            <button
              onClick={() => setCurrentPage('alerts')}
              className={`nav-item ${currentPage === 'alerts' ? 'active' : ''}`}
              title="Alerts"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Alerts</span>
            </button>

            <button
              onClick={() => setCurrentPage('analyze-email')}
              className={`nav-item ${currentPage === 'analyze-email' ? 'active' : ''}`}
              title="Analyze Email"
            >
              <Mail className="w-4 h-4" />
              <span>Analyze Email</span>
            </button>

            <button
              onClick={() => setCurrentPage('analyze-call')}
              className={`nav-item ${currentPage === 'analyze-call' ? 'active' : ''}`}
              title="Analyze Call"
            >
              <Phone className="w-4 h-4" />
              <span>Analyze Call</span>
            </button>

            <button
              onClick={() => setCurrentPage('phone-validator')}
              className={`nav-item ${currentPage === 'phone-validator' ? 'active' : ''}`}
              title="Phone Validator"
            >
              <Phone className="w-4 h-4" />
              <span>Phone Validator</span>
            </button>

            <button
              onClick={() => setCurrentPage('email-history')}
              className={`nav-item ${currentPage === 'email-history' ? 'active' : ''}`}
              title="Email History"
            >
              <Mail className="w-4 h-4" />
              <span>Email History</span>
            </button>

            <button
              onClick={() => setCurrentPage('call-history')}
              className={`nav-item ${currentPage === 'call-history' ? 'active' : ''}`}
              title="Call History"
            >
              <Phone className="w-4 h-4" />
              <span>Call History</span>
            </button>

            <button
              onClick={() => setCurrentPage('whatsapp')}
              className={`nav-item ${currentPage === 'whatsapp' ? 'active' : ''}`}
              title="WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={() => setCurrentPage('imessage')}
              className={`nav-item ${currentPage === 'imessage' ? 'active' : ''}`}
              title="iMessage"
            >
              <MessageCircle className="w-4 h-4" />
              <span>iMessage</span>
            </button>

            <button
              onClick={() => setCurrentPage('url-scanner')}
              className={`nav-item ${currentPage === 'url-scanner' ? 'active' : ''}`}
              title="URL Scanner"
            >
              <Link className="w-4 h-4" />
              <span>URL Scanner</span>
            </button>

            <button
              onClick={() => setCurrentPage('password-checker')}
              className={`nav-item ${currentPage === 'password-checker' ? 'active' : ''}`}
              title="Password Checker"
            >
              <Lock className="w-4 h-4" />
              <span>Password Checker</span>
            </button>

            <button
              onClick={() => setCurrentPage('community-reports')}
              className={`nav-item ${currentPage === 'community-reports' ? 'active' : ''}`}
              title="Community Reports"
            >
              <Users className="w-4 h-4" />
              <span>Community Reports</span>
            </button>

            <div className="nav-divider"></div>

            <button
              onClick={() => setCurrentPage('settings')}
              className={`nav-item ${currentPage === 'settings' ? 'active' : ''}`}
              title="Settings"
            >
              <SettingsIcon className="w-4 h-4" />
              <span>Settings</span>
            </button>

            <span className="text-slate-400 text-sm px-4">{user.email}</span>

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

      <main className="app-main">
        {currentPage === 'home' && (
          <HomePage onNavigate={setCurrentPage} user={user} />
        )}
        {currentPage === 'dashboard' && (
          <Dashboard user={user} authToken={authToken} />
        )}
        {currentPage === 'alerts' && (
          <AlertsPage user={user} authToken={authToken} />
        )}
        {currentPage === 'analyze-email' && (
          <AnalyzeEmailPage user={user} authToken={authToken} />
        )}
        {currentPage === 'analyze-call' && (
          <AnalyzeCallPage user={user} authToken={authToken} />
        )}
        {currentPage === 'email-history' && (
          <EmailHistoryPage user={user} authToken={authToken} />
        )}
        {currentPage === 'call-history' && (
          <CallHistoryPage user={user} authToken={authToken} />
        )}
        {currentPage === 'whatsapp' && (
          <WhatsAppPage user={user} authToken={authToken} />
        )}
        {currentPage === 'imessage' && (
          <IMessagePage user={user} authToken={authToken} />
        )}
        {currentPage === 'phone-validator' && <PhoneValidatorPage />}
        {currentPage === 'settings' && <Settings authToken={authToken} />}
        {currentPage === 'url-scanner' && <URLScanner />}
        {currentPage === 'password-checker' && <PasswordChecker />}
        {currentPage === 'community-reports' && <CommunityReports />}
        {currentPage === 'voice-analyzer' && <VoiceAnalyzer />}
        {currentPage === 'where-to-start' && <WhereToStart onNavigate={setCurrentPage} />}
        {currentPage === 'how-to' && <HowTo onNavigate={setCurrentPage} />}
        {currentPage === 'security-tips' && <SecurityTips onNavigate={setCurrentPage} />}
        {currentPage === 'start-tour' && <StartTour onNavigate={setCurrentPage} />}
        {currentPage === 'get-help' && <GetHelp onNavigate={setCurrentPage} />}
        {currentPage === 'browser-extension' && <BrowserExtension onNavigate={setCurrentPage} />}
      </main>
    </div>
  );
}
