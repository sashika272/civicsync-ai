import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('civicsync-token') || null);
  const [loading, setLoading] = useState(true);

  // Auto load profile on startup if token exists
  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.error('Failed to load user profile from server:', err);
        // Fallback: decode JWT locally for demo robustness
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          // If we are in local offline mode, simulate mock profiles
          if (payload && payload.id) {
            setUser({
              id: payload.id,
              name: payload.id.includes('officer') ? 'Dr. Rajesh Patel' : payload.id.includes('admin') ? 'Smt. Priya Iyer, IAS' : 'Aarav Sharma',
              email: payload.id.includes('officer') ? 'officer@civicsync.in' : payload.id.includes('admin') ? 'admin@civicsync.in' : 'citizen@civicsync.in',
              role: payload.id.includes('officer') ? 'officer' : payload.id.includes('admin') ? 'admin' : 'citizen',
              phone: '9876543210',
              department: payload.id.includes('officer') ? 'Roads & Potholes' : null
            });
          }
        } catch (e) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('civicsync-token', data.token);
        setToken(data.token);
        setUser(data.user);
      }
      return data;
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Server connection failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('civicsync-token', data.token);
        setToken(data.token);
        setUser(data.user);
      }
      return data;
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Server connection failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('civicsync-token');
    setToken(null);
    setUser(null);
  };

  const forgotPassword = async (email) => {
    try {
      const response = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      return await response.json();
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Server connection failed' };
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      const response = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      return await response.json();
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Server connection failed' };
    }
  };

  const resetPassword = async (email, password) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      return await response.json();
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Server connection failed' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      forgotPassword,
      verifyOtp,
      resetPassword
    }}>
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
