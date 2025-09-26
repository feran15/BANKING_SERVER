// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const {
  authLimiter,
  loginLimiter,
  validateRegistration,
  validateLogin,
  authenticateToken
} = require('../middleware/authMiddleware');
const AuthController = require('../controller/authController');

// Public routes
router.post('/register', authLimiter, validateRegistration, AuthController.register);
router.post('/login', loginLimiter, validateLogin, AuthController.login);

// Protected routes
router.get('/me', authenticateToken, AuthController.getCurrentUser);

module.exports = router;