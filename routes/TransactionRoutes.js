const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const Transaction = require("../model/Transaction");
const User = require("../model/Usermodel");
const { authenticateToken } = require("../middleware/authMiddleware");

// Validate transaction input (only receiverId and transactionPin now)
const validateTransaction = (req, res, next) => {
const { receiverId, transactionPin } = req.body;
if (!receiverId || !transactionPin) {
return res.status(400).json({ success: false, message: "Please fill in all required fields" });
}
if (transactionPin.length !== 4) {
return res.status(400).json({ success: false, message: "Transaction PIN must be 4 digits" });
}
next();
};

// Create a new transaction with fixed amount
router.post("/new", authenticateToken, validateTransaction, async (req, res) => {
const { receiverId, transactionPin } = req.body;

try {
// 🔹 Fixed transaction amount (e.g., 500 units)
const fixedAmount = 500;


// Find sender
const sender = await User.findById(req.user.id);
if (!sender) return res.status(404).json({ success: false, message: "Sender not found" });

// Verify transaction PIN
const isPinValid = await bcrypt.compare(transactionPin, sender.transactionPin);
if (!isPinValid) return res.status(400).json({ success: false, message: "Invalid transaction PIN" });

// Find receiver
const receiver = await User.findById(receiverId);
if (!receiver) return res.status(404).json({ success: false, message: "Receiver not found" });

// Check balance
if (sender.balance < fixedAmount) return res.status(400).json({ success: false, message: "Insufficient balance" });

// Update balances
sender.balance -= fixedAmount;
receiver.balance += fixedAmount;
await sender.save();
await receiver.save();

// Save transaction
const transaction = new Transaction({
  sender: sender._id,
  receiver: receiver._id,
  amount: fixedAmount,
  description: "Fixed transfer",
  status: "completed",
});
await transaction.save();

// Generate receipt
const receipt = {
  transactionId: transaction._id,
  date: transaction.createdAt,
  sender: { name: sender.fullName, accountNumber: sender.accountNumber },
  receiver: { name: receiver.fullName, accountNumber: receiver.accountNumber },
  amount: fixedAmount,
  description: transaction.description,
  status: transaction.status,
};

res.json({
  success: true,
  message: "Transaction completed successfully",
  data: transaction,
  receipt,
});

} catch (err) {
console.error("Transaction error:", err);
res.status(500).json({ success: false, message: "Internal server error", error: err.message });
}
});

module.exports = router;