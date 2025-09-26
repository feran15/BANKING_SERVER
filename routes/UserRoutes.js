const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const validator = require('validator');
const User = require('../model/Usermodel');
const AppError = require('../utils/AppError');
const sendMail = require('../utils/mailer');

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    error: 'Too many authentication attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 login attempts per window
  message: {
    error: 'Too many login attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Input validation middleware
const validateRegistration = (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
  const errors = [];

  // Required fields validation
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

  // Name validation (letters, spaces, hyphens, apostrophes only)
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(firstName.trim())) {
    errors.push('First name contains invalid characters');
  }
  if (!nameRegex.test(lastName.trim())) {
    errors.push('Last name contains invalid characters');
  }

  // Email validation
  if (!validator.isEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  // Password validation
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
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

  // Sanitize names
  req.body.firstName = firstName.trim();
  req.body.lastName = lastName.trim();
  req.body.email = email.toLowerCase().trim();

  next();
};

const validateLogin = (req, res, next) => {
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

  if (!validator.isEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  req.body.email = email.toLowerCase().trim();
  next();
};

// Account number generation utility
const generateAccountNumber = () => {
  // Generate 10-digit account number starting with 2 (common for many banks)
  const prefix = '2';
  const suffix = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
  return prefix + suffix;
};

// REGISTER
router.post('/register', authLimiter, validateRegistration, async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ 
        success: false,
        message: 'User with this email already exists' 
      });
    }

    // Generate unique account number
    let accountNumber;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      accountNumber = generateAccountNumber();
      const existingAccount = await User.findOne({ accountNumber });
      if (!existingAccount) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({
        success: false,
        message: 'Unable to generate unique account number. Please try again.'
      });
    }

    // Hash password with higher cost factor for better security
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      accountNumber,
      isEmailVerified: false, // Add email verification status
      createdAt: new Date(),
    });

    const savedUser = await newUser.save();

    // Send welcome email (with better error handling)
    try {
      await sendMail(
        email,
        'Welcome to MyBank - Account Created Successfully',
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to MyBank, ${firstName}!</h2>
          <p>Your account has been created successfully.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Account Details:</h3>
            <p><strong>Account Number:</strong> ${accountNumber}</p>
            <p><strong>Account Holder:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> ${email}</p>
          </div>
          <p>Please keep your account number safe and use it for all transactions.</p>
          <p>Thank you for choosing MyBank!</p>
        </div>
        `
      );
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Continue with registration even if email fails
    }

    // Create JWT
    const token = jwt.sign(
      { 
        id: savedUser._id,
        email: savedUser.email 
      }, 
      process.env.JWT_SECRET,
      {
        expiresIn: '24h', // More explicit time format
        issuer: 'mybank-api',
        audience: 'mybank-client'
      }
    );

    // Respond with token and user (excluding password)
    const { password: pwd, ...userWithoutPassword } = savedUser._doc;
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        ...userWithoutPassword,
        accountNumber // Ensure account number is included in response
      },
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle duplicate key errors (in case email index fails)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    next(error);
  }
});

// LOGIN
router.post('/login', loginLimiter, validateLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and select password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Check if account is active (if you have account status)
    if (user.status === 'inactive' || user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive. Please contact support.'
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Update last login timestamp
    await User.findByIdAndUpdate(user._id, { 
      lastLogin: new Date(),
      $inc: { loginCount: 1 }
    });

    // Create JWT
    const token = jwt.sign(
      { 
        id: user._id,
        email: user.email 
      }, 
      process.env.JWT_SECRET,
      {
        expiresIn: '24h',
        issuer: 'mybank-api',
        audience: 'mybank-client'
      }
    );

    // Respond with token and user data (excluding password)
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        accountNumber: user.accountNumber,
        isEmailVerified: user.isEmailVerified,
        lastLogin: new Date()
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
});

module.exports = router;