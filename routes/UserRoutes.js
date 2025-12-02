// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const {
  authLimiter,
  loginLimiter,
  validateRegistration,
  validateLogin,
  authenticateToken, // this is your auth middleware
} = require('../middleware/authMiddleware');

const AuthController = require('../controller/authController');
const UserController = require('../controller/userController'); // ✅ import UserController

// Public routes
router.post('/register', validateRegistration, AuthController.register);
router.post('/login', loginLimiter, validateLogin, AuthController.login);

// Protected routes
router.get('/me', authenticateToken, AuthController.getCurrentUser);

// Verify recipient by account number
router.get("/verify/:accountNumber", authenticateToken, UserController.verifyRecipient);

module.exports = router;
