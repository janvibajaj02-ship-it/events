const express = require('express');
const jwt = require('jsonwebtoken');
const { signup, login, logout, getMe, resetPassword, updateProfilePic, updateProfile } = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const passport = require('passport');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/')),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.post('/signup', upload.single('profilePic'), signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', auth, getMe);
router.post('/reset-password', resetPassword);
router.put('/profile-pic', auth, upload.single('profilePic'), updateProfilePic);
router.put('/profile', auth, updateProfile);

// Google OAuth
router.get('/google', (req, res, next) => {
  const { role } = req.query;
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    state: role || 'student'
  })(req, res, next);
});
router.get('/google/callback', 
  (req, res, next) => {
    passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed` })(req, res, next);
  },
  (req, res) => {
    // Generate token and redirect to frontend with token in query or cookie
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, { 
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    });
    // also pass token in URL just in case cookies are completely blocked by privacy settings
    res.redirect(`${process.env.FRONTEND_URL}/?token=${token}`);
  }
);

module.exports = router;
