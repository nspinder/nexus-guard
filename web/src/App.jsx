import { useState } from 'react';
import { ClerkProvider, SignedIn, SignedOut, UserButton, useAuth, useUser } from '@clerk/react';
import { AlertCircle, Mail, Phone, Shield } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import './App.css';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function AppContent() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [authToken, setAuthToken] = useState(null);

  // Get auth token when user logs in
  if (user && !authToken) {
    getToken().then(setAuthToken);
    // Store user info in localStorage for API requests
    localStorage.setItem('userId', user.id);
    localStorage.setItem('userEmail', user.primaryEmailAddress?.emailAddress || '');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <SignedOut>
        <Login />
      </SignedOut>

      <SignedIn>
        <div>
          <nav className="bg-slate-800/50 backdrop-blur border-b border-slate-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <Shield className="w-8 h-8 text-blue-400" />
                <h1 className="text-2xl font-bold text-white">NexusGuard</h1>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-slate-300">{user?.primaryEmailAddress?.emailAddress}</span>
                <UserButton
                  appearance={{
                    elements: {
                      userButtonTrigger: 'bg-slate-700 hover:bg-slate-600 text-white rounded-lg',
                    },
                  }}
                />
              </div>
            </div>
          </nav>

          <Dashboard user={user} authToken={authToken} />
        </div>
      </SignedIn>
    </div>
  );
}

export default function App() {
  if (!CLERK_PUBLISHABLE_KEY) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-900">
        <div className="text-white text-center">
          <p className="text-xl font-bold mb-2">Missing Clerk Configuration</p>
          <p>Set VITE_CLERK_PUBLISHABLE_KEY in .env.local</p>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <AppContent />
    </ClerkProvider>
  );
}
