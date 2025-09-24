// routes/DashboardRoutes.js
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // Dummy data for now (replace with real DB queries later)
    const user = { id: "1", name: "Paul", lastLoginDate: new Date() };
    const accounts = [
      { id: "acc1", type: "Checking", balance: 1200 },
      { id: "acc2", type: "Savings", balance: 3500 },
    ];
    const transactions = [
      { id: "t1", amount: -50, description: "Groceries", date: new Date() },
      { id: "t2", amount: 200, description: "Salary", date: new Date() },
    ];
    const analytics = { earnings: 2000, earningsChange: 10, spending: 800, spendingChange: 5, monthlyChange: 15 };
    const spendingCategories = [
      { category: "Food", amount: 300 },
      { category: "Transport", amount: 150 },
    ];
    const insights = [
      { id: "i1", message: "You spent 20% less on transport this month" },
      { id: "i2", message: "Your savings grew by 10% this quarter" },
    ];

    res.json({ user, accounts, transactions, analytics, spendingCategories, insights });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Failed to load dashboard data" });
  }
});

module.exports = router;
