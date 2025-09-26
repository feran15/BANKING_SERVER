// controllers/authController.js
const User = require('../model/UserModel');
const AuthService = require('../Services/authService');
const AppError = require('../utils/AppError');

class AuthController {
  static async getCurrentUser(req, res) {
    try {
      const user = await User.findById(req.user.id).select("-password");
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: "User not found" 
        });
      }
      
      res.json({
        success: true,
        user: AuthService.sanitizeUser(user)
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: "Server error" 
      });
    }
  }

  static async register(req, res) {
    try {
      const { firstName, lastName, email, password } = req.sanitizedBody;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ 
          success: false,
          message: 'User with this email already exists' 
        });
      }

      // Generate unique account number
      const accountNumber = await AuthService.generateUniqueAccountNumber();

      // Hash password
      const hashedPassword = await AuthService.hashPassword(password);

      // Create user
      const newUser = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        accountNumber,
        status:"active",
        isEmailVerified: false,
        createdAt: new Date(),
      });

      const savedUser = await newUser.save();

      // Send welcome email (non-blocking)
      AuthService.sendWelcomeEmail(email, firstName, accountNumber);

      // Generate token
      const token = AuthService.generateToken(savedUser);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: AuthService.sanitizeUser(savedUser)
      });

    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.sanitizedBody;

      // Find user with password
      const user = await User.findOne({ email }).select('+password');
      
      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid email or password' 
        });
      }

      // Check account status
      if (user.status === 'inactive' || user.status === 'suspended') {
        return res.status(403).json({
          success: false,
          message: 'Account is inactive. Please contact support.'
        });
      }

      // Verify password
      const isMatch = await AuthService.comparePasswords(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid email or password' 
        });
      }

      // Update last login
      await User.findByIdAndUpdate(user._id, { 
        lastLogin: new Date(),
        $inc: { loginCount: 1 }
      });

      // Generate token
      const token = AuthService.generateToken(user);

      res.json({
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
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = AuthController;