const express = require("express");
const router = express.Router();
const Transaction = require("../model/Transaction"); // assuming you have a Transaction model
const User = require("../model/Usermodel"); // if you want to update balances

// 🔒 Validate transaction input
const validateTransaction = (req, res, next) => {
  const { senderId, receiverId, amount } = req.body;

  if (!senderId || !receiverId || !amount) {
    return res.status(400).json({
      success: false,
      message: "Sender, receiver, and amount are required",
    });
  }

  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid transaction amount",
    });
  }

  next();
};

// ✅ Get all transactions
router.get("/transactions", async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    res.json({ success: true, total: transactions.length, data: transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch transactions" });
  }
});

// ✅ Create a new transaction (no Paystack, just local transfer)
router.post("/transactions", validateTransaction, async (req, res) => {
  const { senderId, receiverId, amount} = req.body;

  try {
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({
        success: false,
        message: "Sender or receiver not found",
      });
    }

    if (sender.balance < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
      });
    }

    // 💸 Deduct and add balances
    sender.balance -= amount;
    receiver.balance += amount;

    // 💾 Save both users
    await sender.save();
    await receiver.save();

    // 🧾 Save transaction record
    const transaction = new Transaction({
      sender: sender._id,
      receiver: receiver._id,
      amount,
      description: description || "Transfer",
      status: "completed",
    });

    await transaction.save();

    res.json({
      success: true,
      message: "Transaction completed successfully",
      data: transaction,
    });
  } catch (err) {
    console.error("Transaction error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error during transaction",
    });
  }
});

// ✅ Get single transaction by ID
router.get("/transactions/:id", async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.json({ success: true, data: transaction });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching transaction" });
  }
});

// Verify recipient by account number
router.get("/users/verify/:accountNumber", async (req, res) => {
  const { accountNumber } = req.params;

  try {
    const user = await User.findOne({ accountNumber });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Recipient not found",
      });
    }

    res.json({
      success: true,
      data: {
        name: user.fullName,
        accountNumber: user.accountNumber,
        userId: user._id,
      },
    });
  } catch (error) {
    console.error("Account lookup error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;
