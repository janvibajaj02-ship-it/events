const express = require('express');
const jwt = require('jsonwebtoken');
const { signup, login, logout, getMe, resetPassword, updateProfilePic, updateProfile } = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const passport = require('passport');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, '../uploads/'),
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
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Generate token and redirect to frontend with token in query or cookie
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, { httpOnly: true });
    res.redirect(`${process.env.FRONTEND_URL}/`);
  }
);

module.exports = router;
