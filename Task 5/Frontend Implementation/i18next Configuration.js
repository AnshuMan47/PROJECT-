// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      welcome: 'Welcome to our platform!',
      upgradePlan: 'Upgrade your plan',
      points: 'Points',
      transferPoints: 'Transfer Points',
      dailyLimit: 'Daily limit reached'
    }
  },
  es: {
    translation: {
      welcome: '¡Bienvenido a nuestra plataforma!',
      upgradePlan: 'Actualizar plan',
      points: 'Puntos',
      transferPoints: 'Transferir Puntos',
      dailyLimit: 'Límite diario alcanzado'
    }
  },
  hi: {
    translation: {
      welcome: 'हमारे प्लेटफॉर्म में आपका स्वागत है!',
      upgradePlan: 'अपग्रेड प्लान',
      points: 'अंक',
      transferPoints: 'अंक हस्तांतरित करें',
      dailyLimit: 'दैनिक सीमा पूरी हो गई'
    }
  },
  pt: {
    translation: {
      welcome: 'Bem-vindo à nossa plataforma!',
      upgradePlan: 'Atualizar plano',
      points: 'Pontos',
      transferPoints: 'Transferir Pontos',
      dailyLimit: 'Limite diário atingido'
    }
  },
  zh: {
    translation: {
      welcome: '欢迎使用我们的平台！',
      upgradePlan: '升级计划',
      points: '积分',
      transferPoints: '转移积分',
      dailyLimit: '每日限额已达'
    }
  },
  fr: {
    translation: {
      welcome: 'Bienvenue sur notre plateforme !',
      upgradePlan: 'Mettre à niveau le plan',
      points: 'Points',
      transferPoints: 'Transférer des points',
      dailyLimit: 'Limite quotidienne atteinte'
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

export default i18n;