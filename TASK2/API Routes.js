// routes/forgotPassword.js
const express = require('express');
const router = express.Router();
const { requestForgotPassword, completeReset } = require('../controllers/forgotPasswordController');
const checkForgotPasswordLimit = require('../middleware/forgotPasswordLimit');

router.post('/request', checkForgotPasswordLimit, requestForgotPassword);
router.post('/complete', completeReset);

module.exports = router;