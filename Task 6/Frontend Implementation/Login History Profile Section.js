// components/LoginHistory.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const LoginHistory = () => {
  const { t } = useTranslation();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/auth/login-history', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setHistory(res.data.history);
    } catch (error) {
      console.error('Failed to fetch login history');
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (device) => {
    switch (device) {
      case 'mobile': return '📱';
      case 'tablet': return '📲';
      case 'laptop': return '💻';
      case 'desktop': return '🖥️';
      default: return '💾';
    }
  };

  const getBrowserIcon = (browser) => {
    switch (browser?.type) {
      case 'chrome': return '🌐';
      case 'edge': return '🟦';
      case 'firefox': return '🦊';
      case 'safari': return '🧭';
      default: return '🌍';
    }
  };

  if (loading) return <div className="loading">Loading login history...</div>;

  return (
    <div className="login-history">
      <div className="history-header">
        <h2>{t('loginHistory')} ({history.length})</h2>
        <div className="stats">
          <span className="stat failed">{res.data.suspiciousLogins || 0} Failed</span>
          <span className="stat mobile">{history.filter(h => h.device.isMobile).length} Mobile</span>
        </div>
      </div>

      <div className="history-list">
        {history.map((login, index) => (
          <div key={login._id} className={`login-item ${login.loginStatus === 'failed' ? 'failed' : ''}`}>
            <div className="login-info">
              <div className="device-info">
                {getDeviceIcon(login.device.type)}
                <span>{login.device.type?.replace(/\b\w/g, l => l.toUpperCase())}</span>
                {login.device.isMobile && <span className="mobile-tag">Mobile</span>}
              </div>
              <div className="browser-info">
                {getBrowserIcon(login.browser)}
                <span>{login.browser.name} {login.browser.version}</span>
              </div>
              <div className="location-info">
                {login.location?.city || 'Unknown'}, {login.location?.country || 'Unknown'}
              </div>
            </div>
            <div className="login-meta">
              <div className="time">{new Date(login.loginTime).toLocaleString()}</div>
              {login.otpVerified && <span className="otp-badge">OTP ✓</span>}
              {login.loginStatus === 'failed' && <span className="failed-badge">Failed</span>}
            </div>
            <div className="ip-address">IP: {login.ipAddress}</div>
          </div>
        ))}
      </div>
    </div>
  );
};