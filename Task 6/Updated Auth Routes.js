// routes/auth.js (Updated login route)
const { environmentAuth } = require('../middleware/environmentAuth');
const { verifyChromeOtp } = require('../controllers/loginHistoryController');

router.post('/login', async (req, res) => {
  // Standard login logic (email/password or social)
  const user = await authenticateUser(req.body);
  
  const token = generateToken(user);
  
  req.user = user; // Attach to req for middleware
  
  // Apply environment auth
  return environmentAuth(req, res, () => {
    res.json({ token, user: { id: user._id, username: user.username } });
  });
});

// Chrome OTP verification endpoint
router.post('/verify-chrome-otp', verifyChromeOtp, (req, res) => {
  const token = generateToken(req.user);
  res.json({ token, verified: true });
});

// Login history
router.get('/login-history', auth, getLoginHistory);