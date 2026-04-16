// components/Login.jsx (Updated for environment auth)
import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const { t } = useTranslation();
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (credentials) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', credentials);
      
      if (response.data.otpRequired) {
        setOtpStep(true);
      } else {
        // Direct login success
        localStorage.setItem('token', response.data.token);
        window.location.href = '/dashboard';
      }
    } catch (error) {
      alert(error.response?.data?.error || t('loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    try {
      const response = await axios.post('/api/auth/verify-chrome-otp', { otp: otpCode });
      localStorage.setItem('token', response.data.token);
      window.location.href = '/dashboard';
    } catch (error) {
      alert(error.response?.data?.error || 'OTP verification failed');
    }
  };

  if (otpStep) {
    return (
      <div className="otp-verification">
        <h2>🔒 Chrome Verification</h2>
        <p>{t('chromeOtpSent')}</p>
        <div className="otp-input">
          <input
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
            placeholder="Enter 6-digit OTP"
            maxLength="6"
          />
        </div>
        <button onClick={handleOtpVerify} disabled={otpCode.length !== 6}>
          Verify & Login
        </button>
      </div>
    );
  }

  return (
    // Standard login form calling handleLogin
    <form onSubmit={(e) => {
      e.preventDefault();
      handleLogin({ email: email, password: password });
    }}>
      {/* Email, password inputs */}
    </form>
  );
};