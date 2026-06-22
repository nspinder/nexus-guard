import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const userEmail = localStorage.getItem('userEmail');
        const token = localStorage.getItem('authToken');

        if (userId && userEmail && token) {
          // Verify token is still valid
          const isValid = await verifyToken(token);
          if (isValid) {
            setUser({ id: userId, email: userEmail });
            setAuthToken(token);
          } else {
            // Token invalid, clear auth
            logout();
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const verifyToken = async (token) => {
    try {
      if (!token) return false;
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');
      if (!userId || !userEmail) return false;
      const response = await fetch('/api/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-User-Id': userId,
          'X-User-Email': userEmail,
        },
      });
      return response.ok;
    } catch (err) {
      console.error('Token verification failed:', err);
      return false;
    }
  };

  const login = async (userData, token) => {
    try {
      if (!userData?.id || !userData?.email || !token) {
        throw new Error('Invalid login data');
      }
      setError(null);
      setUser(userData);
      setAuthToken(token);
      localStorage.setItem('userId', userData.id);
      localStorage.setItem('userEmail', userData.email);
      localStorage.setItem('authToken', token);

      // Sync user with backend
      try {
        await fetch('/api/auth/sync', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-User-Id': userData.id,
            'X-User-Email': userData.email,
            'Content-Type': 'application/json',
          },
        });
      } catch (syncErr) {
        console.warn('Failed to sync user with backend:', syncErr);
      }

      return true;
    } catch (err) {
      const message = 'Failed to login';
      setError(message);
      console.error(message, err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('authToken');
    setError(null);
  };

  const refreshToken = async () => {
    try {
      // Implementation would refresh the token from backend
      // For now, assume token is still valid if user exists
      if (user && authToken) {
        const isValid = await verifyToken(authToken);
        if (!isValid) {
          logout();
          return false;
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Token refresh failed:', err);
      logout();
      return false;
    }
  };

  const value = {
    user,
    authToken,
    loading,
    error,
    login,
    logout,
    refreshToken,
    isAuthenticated: !!user && !!authToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
