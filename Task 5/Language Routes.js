// routes/language.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
  requestLanguageOTP, 
  verifyLanguageOTP, 
  getLanguageSettings 
} = require('../controllers/languageController');

router.get('/settings', auth, getLanguageSettings);
router.post('/change', auth, requestLanguageOTP);
router.post('/verify', auth, verifyLanguageOTP);

module.exports = router;