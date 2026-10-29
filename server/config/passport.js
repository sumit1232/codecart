const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const User = require('../models/User');

module.exports = () => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn('Google login is off: set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
    return;
  }
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_URL}/api/auth/google/callback`,
    passReqToCallback: true,
  }, async (req, accessToken, refreshToken, profile, done) => {
    try {
      const email = profile._json.email?.toLowerCase();
      if (!email || !profile._json.email_verified) return done(null, false);
      const picture = profile.photos?.[0]?.value;

      let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] }).select('+password');
      if (!user) {
        // new accounts can be student or seller, never admin
        user = await User.create({
          name: profile.displayName, email, googleId: profile.id, avatar: picture,
          role: req.query.state === 'seller' ? 'seller' : 'student', isVerified: true,
        });
      } else {
        if (!user.googleId) user.googleId = profile.id;
        // An unverified email/password signup may belong to an attacker: drop its password
        if (!user.isVerified) { user.password = undefined; user.isVerified = true; }
        if (!user.avatar && picture) user.avatar = picture;
        await user.save();
      }
      done(null, user);
    } catch (e) { done(e); }
  }));
};
