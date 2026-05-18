const authService = require('../services/authService');
const { ValidationError, AppError } = require('../utils/errors');

// Controller: Handles HTTP requests and delegat to service layer

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password, role, rollNo, phone, department } = req.body;
    const profilePic = req.file ? `/uploads/${req.file.filename}` : '';

    const result = await authService.signup({
      name,
      email,
      password,
      role,
      rollNo,
      phone,
      department,
      profilePic
    });

    res.cookie('token', result.token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    res.cookie('token', result.token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    // Verify new password and confirm password match
    if (newPassword !== confirmPassword) {
      throw new ValidationError('Passwords do not match');
    }

    // Get user by email
    const user = await authService.getUserById(req.user._id);
    
    await authService.resetPassword(user._id, newPassword);

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const updates = {
      name: req.body.name,
      phone: req.body.phone,
      department: req.body.department
    };

    const user = await authService.updateProfile(req.user._id, updates);

    res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (error) {
    next(error);
  }
};

exports.updateProfilePic = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ValidationError('No file uploaded');
    }

    const profilePic = `/uploads/${req.file.filename}`;
    const user = await authService.updateProfile(req.user._id, { profilePic });

    res.json({ success: true, message: 'Profile picture updated successfully', user });
  } catch (error) {
    next(error);
  }
};
