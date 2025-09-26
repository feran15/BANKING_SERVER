// middleware/authMiddleware.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const validator = require('validator');
const User = require('../model/UserModel');
const AppError = require('../utils/AppError');

// Rate limiting configurations
const createRateLimit = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: { error: message },
  standardHeaders: true,
  legacyHeaders: false,
});

exports.authLimiter = createRateLimit(15 * 60 * 1000, 5, 'Too many authentication attempts. Please try again later.');
exports.loginLimiter = createRateLimit(15 * 60 * 1000, 6, 'Too many login attempts. Please try again later.');

// Validation middleware
exports.validateRegistration = (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
  const errors = [];

  // Required fields
  if (!firstName?.trim()) errors.push('First name is required');
  if (!lastName?.trim()) errors.push('Last name is required');
  if (!email?.trim()) errors.push('Email is required');
  if (!password) errors.push('Password is required');

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // Name validation
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(firstName.trim())) errors.push('First name contains invalid characters');
  if (!nameRegex.test(lastName.trim())) errors.push('Last name contains invalid characters');

  // Email validation
  if (!validator.isEmail(email)) errors.push('Please provide a valid email address');

  // Password validation
  if (password.length < 8) errors.push('Password must be at least 8 characters long');
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one uppercase letter, one lowercase letter, and one number');
  }

  // Name length validation
  if (firstName.trim().length < 2 || firstName.trim().length > 50) {
    errors.push('First name must be between 2 and 50 characters');
  }
  if (lastName.trim().length < 2 || lastName.trim().length > 50) {
    errors.push('Last name must be between 2 and 50 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // Sanitize inputs
  req.sanitizedBody = {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.toLowerCase().trim(),
    password
  };

  next();
};

exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email?.trim()) errors.push('Email is required');
  if (!password) errors.push('Password is required');

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  if (!validator.isEmail(email)) errors.push('Please provide a valid email address');

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  req.sanitizedBody = {
    email: email.toLowerCase().trim(),
    password
  };

  next();
};

// Authentication middleware
exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};