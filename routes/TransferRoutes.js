// routes/transfer.js
const express = require ("express");
const User = require ("../models/User.js");
const Transaction = require ("../models/Transaction.js");
const { verifyToken } = require ("../middleware/auth.js");

const router = express.Router();

router.post("/Send", verifyToken, async (req, res) => {
  const { amount, toEmail, description } = req.body;

  if (!amount || !toEmail) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const sender = await User.findById(req.user.id);
  const recipient = await User.findOne({ email: toEmail });

  if (!recipient) return res.status(404).json({ message: "Recipient not found" });
  if (sender.balance < amount) return res.status(400).json({ message: "Insufficient funds" });

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
});

export default router;
