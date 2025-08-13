const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../model/Usermodel.js");
const Transaction = require("../model/Transaction.js");
const { verifyToken } = require("../middleware/auth.js");

const router = express.Router();

// Apply verifyToken middleware so req.user is available
router.post("/send", verifyToken, async (req, res) => {
  try {
    const { amount, toEmail, pin, description } = req.body;

    if (!amount || !toEmail || !pin) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find sender
    const sender = await User.findById(req.user.id);
    if (!sender) return res.status(404).json({ message: "Sender not found" });

    // Verify PIN
    const isPinValid = await bcrypt.compare(pin, sender.transactionPin);
    if (!isPinValid) {
      return res.status(403).json({ message: "Invalid transaction PIN" });
    }

    // Find recipient
    const recipient = await User.findOne({ email: toEmail });
    if (!recipient) return res.status(404).json({ message: "Recipient not found" });

    // Check balance
    if (sender.balance < amount) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    // Update balances
    sender.balance -= amount;
    recipient.balance += amount;

    await sender.save();
    await recipient.save();

    // Log both transactions
    await Transaction.create([
      {
        user: sender._id,
        type: "debit",
        amount,
        description: description || `Sent to ${toEmail}`,
      },
      {
        user: recipient._id,
        type: "credit",
        amount,
        description: description || `Received from ${sender.email}`,
      },
    ]);

    res.json({ message: "Transfer successful" });
  } catch (error) {
    console.error("Transfer error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
