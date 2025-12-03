const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const Transaction = require("../model/Transaction");
const User = require("../model/Usermodel");
const { authenticateToken } = require("../middleware/authMiddleware");

// Validate transaction input
const validateTransaction = (req, res, next) => {
const { receiverId, amount, transactionPin } = req.body;
if (!receiverId || !amount || !transactionPin) {
return res.status(400).json({ success: false, message: "Please fill in all required fields" });
}
if (isNaN(amount) || amount <= 0) {
return res.status(400).json({ success: false, message: "Invalid transaction amount" });
}
if (transactionPin.length !== 4) {
return res.status(400).json({ success: false, message: "Transaction PIN must be 4 digits" });
}
next();
};

// Get all transactions (protected)
router.get("/", authenticateToken, async (req, res) => {
try {
const transactions = await Transaction.find().sort({ createdAt: -1 });
res.json({ success: true, total: transactions.length, data: transactions });
} catch (err) {
console.error("Fetch transactions error:", err);
res.status(500).json({ success: false, message: "Failed to fetch transactions" });
}
});

// Create a new transaction (protected)
router.post("/new", authenticateToken, validateTransaction, async (req, res) => {
const { receiverId, amount, transactionPin } = req.body;

try {
// Find sender
const sender = await User.findById(req.user.id);
if (!sender) return res.status(404).json({ success: false, message: "Sender not found" });

// Verify PIN
const isPinValid = await bcrypt.compare(transactionPin, sender.transactionPin);
if (!isPinValid) return res.status(400).json({ success: false, message: "Invalid transaction PIN" });

// Find receiver
const receiver = await User.findById(receiverId);
if (!receiver) return res.status(404).json({ success: false, message: "Receiver not found" });

// Check balance
if (sender.balance < amount) return res.status(400).json({ success: false, message: "Insufficient balance" });

// Update balances
sender.balance -= amount;
receiver.balance += amount;
await sender.save();
await receiver.save();

// Save transaction
const transaction = new Transaction({
  sender: sender._id,
  receiver: receiver._id,
  amount,
  description: "Transfer",
  status: "completed",
});
await transaction.save();

res.json({ success: true, message: "Transaction completed successfully", data: transaction });

} catch (err) {
console.error("Transaction error:", err);
res.status(500).json({ success: false, message: "Internal server error", error: err.message });
}
});

module.exports = router;
