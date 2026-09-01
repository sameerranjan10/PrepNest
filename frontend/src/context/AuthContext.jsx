import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('prepnest_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('prepnest_token') || null;
  });

  const [loading, setLoading] = useState(true);

  // Sync / refresh user data from backend on mount if token is present
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const savedToken = localStorage.getItem('prepnest_token');
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('http://localhost:8000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${savedToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.ok) {
          const freshUser = await res.json();
          setUser(freshUser);
          localStorage.setItem('prepnest_user', JSON.stringify(freshUser));
        } else if (res.status === 401) {
          // Token invalid or expired
          logout();
        }
      } catch (err) {
        console.warn('Could not refresh user session from backend:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  const login = (userData, accessToken) => {
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem('prepnest_token', accessToken);
    localStorage.setItem('prepnest_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('prepnest_token');
    localStorage.removeItem('prepnest_user');
  };

  const updateUser = (updatedFields) => {
    setUser(prev => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('prepnest_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        loading,
        login,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
