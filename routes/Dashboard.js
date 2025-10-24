// routes/Dashboard.js
const express = require("express");
const router = express.Router();
const User = require("../model/Usermodel");
const auth = require("../middleware/auth"); // import middleware

// Dashboard endpoint
router.get("/body", auth, async (req, res) => {
  try {
    // Find the current user in MongoDB
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Example accounts & transactions
    const accounts = [
      {
        type: "Main",
        accountNumber: user.accountNumber,
        balance: user.balance || 0,
      },
    ];

    const transactions = [
      { id: "t1", amount: -50, description: "Groceries", date: new Date() },
      { id: "t2", amount: 200, description: "Salary", date: new Date() },
    ];

    res.json({
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
      },
      accountNumber: user.accountNumber,  
      transactions,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Failed to load dashboard data" });
  }
});

module.exports = router;
