// components/LanguageSwitcher.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [languages] = useState([
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ]);
  const [otpStep, setOtpStep] = useState('select'); // 'select' | 'verify'
  const [selectedLang, setSelectedLang] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLanguageSelect = async (langCode) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/language/change', { language: langCode }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.otpRequired) {
        setOtpStep('verify');
        setSelectedLang(langCode);
        setMessage(response.data.message);
      } else {
        // Immediate change
        i18n.changeLanguage(langCode);
        setMessage(response.data.message);
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Language change failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post('/api/language/verify', {
        otp: otpCode,
        language: selectedLang
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      i18n.changeLanguage(selectedLang);
      setOtpStep('select');
      setMessage(response.data.message);
      setOtpCode('');
    } catch (error) {
      alert(error.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="language-switcher">
      <button className="current-lang" onClick={() => setOtpStep('select')}>
        {languages.find(l => l.code === i18n.language)?.flag} {i18n.language.toUpperCase()}
      </button>

      {otpStep === 'select' && (
        <div className="lang-dropdown">
          <div className="lang-list">
            {languages.map(lang => (
              <button
                key={lang.code}
                className={`lang-option ${i18n.language === lang.code ? 'active' : ''}`}
                onClick={() => handleLanguageSelect(lang.code)}
                disabled={loading}
              >
                {lang.flag} {lang.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {otpStep === 'verify' && (
        <div className="otp-modal">
          <div className="otp-container">
            <h3>🔒 Verify Language Change</h3>
            <p>{message}</p>
            <p className="method-hint">
              {selectedLang === 'fr' ? '📧 Check your email' : '📱 Check your phone'}
            </p>
            
            <form onSubmit={handleOtpVerify}>
              <div className="otp-input">
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                  autoFocus
                  required
                />
              </div>
              <div className="otp-actions">
                <button 
                  type="button" 
                  onClick={() => setOtpStep('select')}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading || otpCode.length !== 6}>
                  {loading ? 'Verifying...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {message && (
        <div className={`message ${otpStep === 'select' ? 'show' : ''}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;