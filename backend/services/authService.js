// Authentication Service Layer - Business Logic

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { AuthenticationError, ConflictError, NotFoundError } = require('../utils/errors');
const { validateSignup, validateLogin, validatePasswordReset } = require('../validators/authValidator');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

const authService = {
  // Sign up new user
  async signup(signupData) {
    validateSignup(signupData);
    
    const { name, email, password, role = 'student', rollNo, phone, department, profilePic } = signupData;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new ConflictError('User with this email already exists');
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      rollNo,
      phone,
      department,
      profilePic
    });

    const token = generateToken(user._id);
    
    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic
      },
      token
    };
  },

  // Login user
  async login(email, password) {
    validateLogin({ email, password });

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      throw new AuthenticationError('Invalid email or password');
    }

    const token = generateToken(user._id);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        department: user.department,
        rollNo: user.rollNo
      },
      token
    };
  },

  // Get user by ID
  async getUserById(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new NotFoundError('User');
    }
    return user;
  },

  // Update user profile
  async updateProfile(userId, updateData) {
    const allowedFields = ['name', 'phone', 'department', 'profilePic'];
    const updates = {};

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    });

    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
    if (!user) {
      throw new NotFoundError('User');
    }
    return user;
  },

  // Request password reset (generate token)
  async requestPasswordReset(email) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFoundError('User');
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30m' });
    return resetToken;
  },

  // Reset password
  async resetPassword(userId, newPassword) {
    validatePasswordReset({ password: newPassword, confirmPassword: newPassword });

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    user.password = newPassword;
    await user.save();

    return { message: 'Password reset successful' };
  }
};

module.exports = authService;
