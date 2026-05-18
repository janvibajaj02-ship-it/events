// Authentication Validators

const { ValidationError } = require('../utils/errors');

const validateSignup = (data) => {
  const { name, email, password, role, rollNo, phone, department } = data;

  if (!name || name.trim() === '') {
    throw new ValidationError('Name is required');
  }

  if (!email || !isValidEmail(email)) {
    throw new ValidationError('Valid email is required');
  }

  if (!password || password.length < 6) {
    throw new ValidationError('Password must be at least 6 characters long');
  }

  if (role && !['student', 'organizer', 'admin'].includes(role)) {
    throw new ValidationError('Invalid role');
  }

  return true;
};

const validateLogin = (data) => {
  const { email, password } = data;

  if (!email || !isValidEmail(email)) {
    throw new ValidationError('Valid email is required');
  }

  if (!password) {
    throw new ValidationError('Password is required');
  }

  return true;
};

const validatePasswordReset = (data) => {
  const { password, confirmPassword } = data;

  if (!password || password.length < 6) {
    throw new ValidationError('Password must be at least 6 characters long');
  }

  if (password !== confirmPassword) {
    throw new ValidationError('Passwords do not match');
  }

  return true;
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

module.exports = {
  validateSignup,
  validateLogin,
  validatePasswordReset
};
