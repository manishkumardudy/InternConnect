import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import i18n from '../i18n';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync language with i18n
  const applyLanguage = (userData) => {
    if (userData && userData.preferredLanguage && i18n.language !== userData.preferredLanguage) {
      i18n.changeLanguage(userData.preferredLanguage);
    }
  };

  // Restore session on boot
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        applyLanguage(parsed);
      }
      
      // Hit the refresh endpoint to verify the refresh token cookie
      try {
        if (storedToken) {
          const res = await api.post('/auth/refresh');
          const { user: updatedUser, accessToken } = res.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
          applyLanguage(updatedUser);
        }
      } catch (err) {
        console.log('Session expired or credentials missing.');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();

    // Listen for forced logouts from Axios interceptor
    const handleForcedLogout = () => {
      setUser(null);
    };

    window.addEventListener('auth_logout', handleForcedLogout);
    return () => {
      window.removeEventListener('auth_logout', handleForcedLogout);
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      
      // Handle Chrome OTP Requirement
      if (res.data.otpRequired) {
        return {
          success: false,
          otpRequired: true,
          tempLoginToken: res.data.tempLoginToken,
          message: res.data.message
        };
      }

      const { user: userData, accessToken } = res.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      applyLanguage(userData);
      
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Check your credentials.',
        blocked: err.response?.data?.blocked || false,
        reason: err.response?.data?.reason || ''
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      
      // If registration requires OTP verification
      if (res.data.otpRequired) {
        return {
          success: false,
          otpRequired: true,
          tempRegistrationToken: res.data.tempRegistrationToken,
          message: res.data.message,
          user: res.data.user
        };
      }

      const { user: userData, accessToken } = res.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      applyLanguage(userData);
      
      return { success: true, user: userData };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed.'
      };
    } finally {
      setLoading(false);
    }
  };

  const verifyRegisterOtp = async (tempRegistrationToken, code) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-register-otp', { tempRegistrationToken, code });
      const { user: userData, accessToken } = res.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      applyLanguage(userData);

      return { success: true, user: userData };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to verify registration OTP.'
      };
    } finally {
      setLoading(false);
    }
  };

  const resendRegisterOtp = async (tempRegistrationToken) => {
    try {
      const res = await api.post('/auth/resend-register-otp', { tempRegistrationToken });
      return { success: true, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to resend registration OTP.'
      };
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error on server:', err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      verifyRegisterOtp,
      resendRegisterOtp,
      logout,
      setUser,
      applyLanguage
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
