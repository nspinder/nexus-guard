import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import NavigationLayout from './components/NavigationLayout';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import HomePage from './pages/Home';
import Dashboard from './pages/Dashboard';
import AlertsPage from './pages/AlertsPage';
import AnalyzeEmailPage from './pages/AnalyzeEmailPage';
import AnalyzeCallPage from './pages/AnalyzeCallPage';
import EmailHistoryPage from './pages/EmailHistoryPage';
import CallHistoryPage from './pages/CallHistoryPage';
import WhatsAppPage from './pages/WhatsAppPage';
import IMessagePage from './pages/IMessagePage';
import PhoneValidatorPage from './pages/PhoneValidatorPage';
import Settings from './pages/Settings';
import URLScanner from './pages/URLScanner';
import PhoneValidator from './pages/PhoneValidator';
import PasswordChecker from './pages/PasswordChecker';
import CommunityReports from './pages/CommunityReports';
import VoiceAnalyzer from './pages/VoiceAnalyzer';
import WhereToStart from './pages/WhereToStart';
import HowTo from './pages/HowTo';

export default function AppRouter() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />

              {/* Protected Routes - Authenticated User Pages */}
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/alerts"
                element={
                  <ProtectedRoute>
                    <AlertsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analyze-email"
                element={
                  <ProtectedRoute>
                    <AnalyzeEmailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analyze-call"
                element={
                  <ProtectedRoute>
                    <AnalyzeCallPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/email-history"
                element={
                  <ProtectedRoute>
                    <EmailHistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/call-history"
                element={
                  <ProtectedRoute>
                    <CallHistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/whatsapp"
                element={
                  <ProtectedRoute>
                    <WhatsAppPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/imessage"
                element={
                  <ProtectedRoute>
                    <IMessagePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/phone-validator"
                element={
                  <ProtectedRoute>
                    <PhoneValidatorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />

              {/* Legacy Routes - Keep for backwards compatibility */}
              <Route
                path="/url-scanner"
                element={
                  <ProtectedRoute>
                    <URLScanner />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/password-checker"
                element={
                  <ProtectedRoute>
                    <PasswordChecker />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/community-reports"
                element={
                  <ProtectedRoute>
                    <CommunityReports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/voice-analyzer"
                element={
                  <ProtectedRoute>
                    <VoiceAnalyzer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/where-to-start"
                element={
                  <ProtectedRoute>
                    <WhereToStart />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/how-to"
                element={
                  <ProtectedRoute>
                    <HowTo />
                  </ProtectedRoute>
                }
              />

              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
