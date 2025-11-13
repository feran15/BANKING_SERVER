const express = require("express");
const router = express.Router();
const Transaction = require("../model/Transaction"); // assuming you have a Transaction model
const User = require("../model/Usermodel"); // if you want to update balances

// 🔒 Validate transaction input
const validateTransaction = (req, res, next) => {
  const { accountNumber, amount } = req.body;

  if (!accountNumber || !amount) {
    return res.status(400).json({
      success: false,
      message: "Account Number and amount are required",
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
router.post("/new-transaction", validateTransaction, async (req, res) => {
  const { accountNumber, amount, senderId } = req.body;

  try {
    console.log("Incoming transaction request:", { senderId, accountNumber, amount });

    // 🧩 Check sender
    const sender = await User.findById(senderId);
    if (!sender) {
      console.log("❌ Sender not found for ID:", senderId);
      return res.status(404).json({
        success: false,
        message: "Sender not found",
      });
    }

    // 🧩 Check receiver
    const receiver = await User.findOne({ accountNumber });
    if (!receiver) {
      console.log("❌ Receiver not found for account number:", accountNumber);
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    // 💰 Check sender balance
    if (sender.balance < amount) {
      console.log("⚠️ Insufficient balance. Sender balance:", sender.balance);
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
      });
    }

    // 💸 Update balances
    sender.balance -= amount;
    receiver.balance += amount;

    await sender.save();
    await receiver.save();

    // 🧾 Save transaction record
    const transaction = new Transaction({
      sender: sender._id,
      receiver: receiver._id,
      amount,
      description: "Transfer",
      status: "completed",
    });

    await transaction.save();

    console.log("✅ Transaction successful:", transaction);

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
      error: err.message,
    });
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
