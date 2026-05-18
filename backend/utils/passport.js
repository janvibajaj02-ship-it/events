const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      // Get role from state (passed from frontend)
      const role = req.query.state || 'student';
      
      // 1. Check if user with this googleId exists
      let user = await User.findOne({ googleId: profile.id });
      if (user) return done(null, user);

      // 2. Check if user with this email already exists
      const email = profile.emails[0].value;
      user = await User.findOne({ email });

      if (user) {
        // Link googleId to existing user
        user.googleId = profile.id;
        await user.save();
        return done(null, user);
      }

      // 3. Create new user
      user = await User.create({
        name: profile.displayName,
        email: email,
        googleId: profile.id,
        role: role
      });
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

module.exports = passport;
