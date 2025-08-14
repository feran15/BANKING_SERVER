const express = require('express');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth'); // JWT middleware
const User = require('../model/Usermodel');

const router = express.Router();

// Set or update transaction PIN
router.post('/set-pin', auth, async (req, res) => {
  try {
    const { pin } = req.body;

    // Check if PIN is provided
    if (!pin) {
      return res.status(400).json({ message: 'Please provide a transaction PIN' });
    }

    // Ensure PIN is exactly 4 digits
    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({ message: 'PIN must be exactly 4 digits' });
    }

    // Hash PIN before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash(pin, salt);

    // Update user with hashed PIN
    await User.findByIdAndUpdate(req.user.id, { transactionPin: hashedPin });

    res.status(200).json({ message: 'Transaction PIN set successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
