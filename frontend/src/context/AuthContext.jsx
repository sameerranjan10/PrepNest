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

  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem('prepnest_token');
      localStorage.removeItem('prepnest_user');
    };
    window.addEventListener('prepnest:auth-expired', handleExpired);
    return () => window.removeEventListener('prepnest:auth-expired', handleExpired);
  }, []);

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
    if (!savedToken) {
      return { success: false, warning: 'You must be signed in to save profile changes.' };
    }

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
        if (res.status === 401) {
          window.dispatchEvent(new CustomEvent('prepnest:auth-expired'));
        }
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to update profile on server');
      }
    } catch (err) {
      return { success: false, warning: err.message || 'Could not reach server to save profile.' };
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

  const uploadAvatar = async (fileBlob, fileName = 'avatar.webp') => {
    const savedToken = localStorage.getItem('prepnest_token') || token;
    if (!savedToken) {
      return { success: false, error: 'You must be signed in to upload a profile picture.' };
    }

    try {
      const formData = new FormData();
      formData.append('file', fileBlob, fileName);

      const res = await fetch(`${API_BASE}/api/user/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${savedToken}`,
        },
        body: formData,
      });

      if (!res.ok) {
        if (res.status === 401) {
          window.dispatchEvent(new CustomEvent('prepnest:auth-expired'));
        }
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to upload profile picture');
      }

      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('prepnest_user', JSON.stringify(data.user));
      } else if (data.avatar_url !== undefined) {
        updateUser({ avatar_url: data.avatar_url });
      }
      return { success: true, avatar_url: data.avatar_url, user: data.user };
    } catch (err) {
      return { success: false, error: err.message || 'Could not upload profile picture.' };
    }
  };

  const removeAvatar = async () => {
    const savedToken = localStorage.getItem('prepnest_token') || token;
    if (!savedToken) {
      return { success: false, error: 'You must be signed in to remove your profile picture.' };
    }

    try {
      const res = await fetch(`${API_BASE}/api/user/avatar`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${savedToken}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          window.dispatchEvent(new CustomEvent('prepnest:auth-expired'));
        }
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to remove profile picture');
      }

      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('prepnest_user', JSON.stringify(data.user));
      } else {
        updateUser({ avatar_url: null });
      }
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message || 'Could not remove profile picture.' };
    }
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
        changePassword,
        uploadAvatar,
        removeAvatar,
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
