const router = require('express').Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const wrap = require('../utils/wrap');
const publicUser = require('../utils/publicUser');
const { sendOtp } = require('../utils/mailer');
const { protect } = require('../middleware/auth');

const hash = (v) => crypto.createHash('sha256').update(v).digest('hex');
const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '7d' });

async function issueOtp(user) {
  const otp = String(crypto.randomInt(100000, 1000000));
  user.otpHash = hash(otp);
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  user.otpAttempts = 0;
  await user.save();
  await sendOtp(user.email, user.name, otp);
}

router.post('/register', wrap(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || password.length < 6)
    return res.status(400).json({ message: 'Name, email and a password of 6+ characters are required' });
  const safeRole = role === 'seller' ? 'seller' : 'student'; // admin can never be self-assigned

  let user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (user?.isVerified) return res.status(400).json({ message: 'This email is already registered. Log in instead.' });
  if (user) { user.name = name; user.password = password; user.role = safeRole; }
  else user = new User({ name, email, password, role: safeRole });

  await issueOtp(user);
  res.status(201).json({ message: 'Verification code sent', email: user.email });
}));

router.post('/verify-otp', wrap(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() }).select('+otpHash +otpExpires +otpAttempts');
  if (!user || !user.otpHash) return res.status(400).json({ message: 'Request a new code' });
  if (user.otpExpires < new Date()) return res.status(400).json({ message: 'Code expired. Request a new one.' });
  if (user.otpAttempts >= 5) return res.status(429).json({ message: 'Too many attempts. Request a new code.' });

  const ok = crypto.timingSafeEqual(Buffer.from(hash(String(otp))), Buffer.from(user.otpHash));
  if (!ok) { user.otpAttempts += 1; await user.save(); return res.status(400).json({ message: 'Incorrect code' }); }

  user.isVerified = true; user.otpHash = undefined; user.otpExpires = undefined; user.otpAttempts = 0;
  await user.save();
  res.json({ token: signToken(user._id), user: publicUser(user) });
}));

router.post('/resend-otp', wrap(async (req, res) => {
  const user = await User.findOne({ email: (req.body.email || '').toLowerCase() });
  if (!user || user.isVerified) return res.status(400).json({ message: 'Nothing to verify for this email' });
  await issueOtp(user);
  res.json({ message: 'New code sent' });
}));

router.post('/login', wrap(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() }).select('+password');
  if (user && !user.password) return res.status(400).json({ message: 'This account uses Google sign-in. Use the Google button.' });
  if (!user || !(await user.matchPassword(password || ''))) return res.status(401).json({ message: 'Incorrect email or password' });
  if (!user.isVerified) {
    await issueOtp(user);
    return res.status(403).json({ message: 'Verify your email first. We sent a new code.', needsVerification: true, email: user.email });
  }
  res.json({ token: signToken(user._id), user: publicUser(user) });
}));

// ---- Google login with Passport (stateless, no sessions) ----
const clientAuth = (q = '') => `${process.env.CLIENT_URL}/auth${q}`;

router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID) return res.redirect(clientAuth('?error=google_off'));
  passport.authenticate('google', {
    scope: ['profile', 'email'], session: false, prompt: 'select_account',
    state: req.query.role === 'seller' ? 'seller' : 'student', // read back as req.query.state in the strategy
  })(req, res, next);
});

router.get('/google/callback',
  (req, res, next) => passport.authenticate('google', { session: false, failureRedirect: clientAuth('?error=google') })(req, res, next),
  (req, res) => {
    // token travels in the URL fragment so it never reaches server logs or Referer headers
    const dest = req.user.role === 'seller' ? 'seller' : 'dashboard';
    res.redirect(`${process.env.CLIENT_URL}/auth/callback#token=${signToken(req.user._id)}&next=${dest}`);
  });

router.get('/me', protect, (req, res) => res.json({ user: publicUser(req.user) }));

module.exports = router;
