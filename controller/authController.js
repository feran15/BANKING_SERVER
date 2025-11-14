const User = require('../model/Usermodel');
const bcrypt = require('bcryptjs');
const authService = require('../Services/authService');

class AuthController {
  // ---------------------------
  // Get Current User
  // ---------------------------
  static async getCurrentUser(req, res) {
    try {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.json({ success: true, user: authService.sanitizeUser(user) });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // ---------------------------
  // Register
  // ---------------------------
  static async register(req, res) {
    try {
      const { firstName, lastName, email, password } = req.sanitizedBody;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ success: false, message: 'User with this email already exists' });
      }

      const accountNumber = await authService.generateUniqueAccountNumber();
      const hashedPassword = await authService.hashPassword(password);

      const newUser = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        accountNumber,
        generatedAccountNumber: accountNumber,
        isEmailVerified: false,
        createdAt: new Date(),
      });

      const savedUser = await newUser.save();

      authService.sendWelcomeEmail(email, firstName, accountNumber);
      const token = authService.generateToken(savedUser);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        accountNumber,
        user: authService.sanitizeUser(savedUser),
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (error.code === 11000) {
        return res.status(409).json({ success: false, message: 'User with this email already exists' });
      }
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // ---------------------------
  // Login
  // ---------------------------
  static async login(req, res) {
    try {
      const { email, password } = req.sanitizedBody;

      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      if (user.status === 'inactive' || user.status === 'suspended') {
        return res.status(403).json({ success: false, message: 'Account is inactive. Contact support.' });
      }

      const isMatch = await authService.comparePasswords(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      await User.findByIdAndUpdate(user._id, { lastLogin: new Date(), $inc: { loginCount: 1 } });

      const token = authService.generateToken(user);

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          generatedAccountNumber: user.accountNumber,
          isEmailVerified: user.isEmailVerified,
          lastLogin: new Date(),
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Login failed', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
  }

  // ---------------------------
  // Set Transaction PIN
  // ---------------------------
  static async setTransactionPin(req, res) {
    try {
      const { pin } = req.body;

      if (!pin || !/^\d{4}$/.test(pin)) {
        return res.status(400).json({ success: false, message: 'PIN must be exactly 4 digits' });
      }

      const hashedPin = await bcrypt.hash(pin, 10);

      const user = await User.findByIdAndUpdate(req.user.id, { transactionPin: hashedPin }, { new: true });

      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      res.json({ success: true, message: 'Transaction PIN set successfully' });
    } catch (error) {
      console.error('Error setting PIN:', error);
      res.status(500).json({ success: false, message: 'Server error while setting PIN', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
  }

  // ---------------------------
  // Verify Transaction PIN
  // ---------------------------
  static async verifyTransactionPin(req, res) {
    try {
      const { pin } = req.body;

      if (!pin) return res.status(400).json({ success: false, message: 'PIN is required' });

      const user = await User.findById(req.user.id).select('+transactionPin');
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      const isMatch = await bcrypt.compare(pin, user.transactionPin);

      if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid Transaction PIN' });

      res.json({ success: true, message: 'PIN verified successfully', userId: user._id });
    } catch (error) {
      console.error('Error verifying PIN:', error);
      res.status(500).json({ success: false, message: 'Server error while verifying PIN' });
    }
  }
}

module.exports = AuthController;
