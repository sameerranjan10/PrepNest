import React, { createContext, useContext, useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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

  // Sync / verify user session with backend & Neon Auth on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const savedToken = localStorage.getItem('prepnest_token');
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
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
    const savedToken = localStorage.getItem('prepnest_token') || token;
    if (savedToken) {
      try {
        fetch(`${API_BASE}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${savedToken}` }
        }).catch(() => {});
      } catch {}
    }
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

  const updateProfile = async (profileData) => {
    const savedToken = localStorage.getItem('prepnest_token') || token;
    if (savedToken) {
      try {
        const res = await fetch(`${API_BASE}/api/user/profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${savedToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(profileData)
        });

        if (res.ok) {
          const updatedUser = await res.json();
          setUser(updatedUser);
          localStorage.setItem('prepnest_user', JSON.stringify(updatedUser));
          return { success: true, user: updatedUser };
        } else {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || 'Failed to update profile on server');
        }
      } catch (err) {
        console.warn('Backend update failed, saving locally:', err.message);
        updateUser(profileData);
        return { success: true, user: { ...user, ...profileData }, warning: err.message };
      }
    } else {
      updateUser(profileData);
      return { success: true, user: { ...user, ...profileData } };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    const savedToken = localStorage.getItem('prepnest_token') || token;
    if (!savedToken) {
      throw new Error('You must be logged in to change your password');
    }

    const res = await fetch(`${API_BASE}/api/user/password`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${savedToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Failed to update password');
    }

    return await res.json();
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
        updateUser,
        updateProfile,
        changePassword
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
