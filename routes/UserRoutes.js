const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/Usermodel');
const AppError = require('../utils/AppError');

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword
    });

    const savedUser = await newUser.save();

    // Exclude password from response
    const { password: pwd, ...userWithoutPassword } = savedUser._doc;

    res.status(201).json({
      message: "User registered successfully",
      user: userWithoutPassword
    });
    // Logs Token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
     expiresIn: '1d',
  });
  res.status(200).json({token, user:{ id: user._id, email: user.email } })
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    // ✅ Send full user data needed by frontend
    res.status(200).json({ 
      token, 
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

