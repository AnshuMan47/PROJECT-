// pages/ForgotPassword.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [identifier, setIdentifier] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('request'); // 'request' | 'success'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post('/api/auth/forgot-password/request', {
        identifier: identifier.trim()
      });

      if (response.data.success) {
        setMessage(response.data.message);
        setStep('success');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Something went wrong';
      
      // Handle daily limit specifically
      if (errorMsg.includes('one time per day')) {
        setError('You can use this option only one time per day.');
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const isValidIdentifier = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    
    return emailRegex.test(identifier) || phoneRegex.test(identifier);
  };

  const getIdentifierPlaceholder = () => {
    if (identifier.includes('@')) return 'Enter your email address';
    if (identifier.match(/^\d/)) return 'Enter your phone number';
    return 'Email address or phone number';
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <div className="logo-section">
            <h1>🔒 Reset Password</h1>
            <p>Enter your email or phone number to receive a new password</p>
          </div>

          {step === 'request' && (
            <form onSubmit={handleSubmit} className="forgot-form">
              <div className="input-group">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={getIdentifierPlaceholder()}
                  className={`identifier-input ${!isValidIdentifier() && identifier ? 'invalid' : ''}`}
                  autoFocus
                />
                <div className="input-hint">
                  We'll send you a new password if account exists
                </div>
              </div>

              {error && (
                <div className="error-message">
                  <span role="img" aria-label="error">⚠️</span>
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={!isValidIdentifier() || loading}
                className="submit-btn"
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Sending...
                  </>
                ) : (
                  'Send New Password'
                )}
              </button>

              <div className="form-footer">
                <Link to="/login">← Back to Login</Link>
              </div>
            </form>
          )}

          {step === 'success' && (
            <div className="success-screen">
              <div className="success-icon">✅</div>
              <h2>Check Your Email/Phone</h2>
              <p>{message}</p>
              <p className="tip">
                <strong>💡 Tip:</strong> Check spam folder if you don't see the email.
              </p>
              <div className="action-buttons">
                <Link to="/login" className="login-btn">Go to Login</Link>
                <button 
                  onClick={() => setStep('request')}
                  className="retry-btn"
                >
                  Try Different Email/Phone
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;