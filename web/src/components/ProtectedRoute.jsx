import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NavigationLayout from './NavigationLayout';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <NavigationLayout>{children}</NavigationLayout>;
}
