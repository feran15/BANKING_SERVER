// routes/AIInsightsRoutes.js
const express = require("express");
const router = express.Router();

// 1. Current user
router.get("/user/current", (req, res) => {
  res.json({
    id: "u1",
    name: "Paul",
    email: "paul@example.com",
    lastLoginDate: new Date().toISOString()
  });
});

// 2. Accounts
router.get("/accounts", (req, res) => {
  res.json([
    { id: "a1", type: "Checking", balance: 2400 },
    { id: "a2", type: "Savings", balance: 5000 }
  ]);
});

// 3. Transactions
router.get("/transactions", (req, res) => {
  res.json([
    { id: "t1", description: "ATM Withdrawal", amount: -100, date: new Date().toISOString() },
    { id: "t2", description: "Salary", amount: 2000, date: new Date().toISOString() }
  ]);
});

// 4. Analytics
router.get("/analytics", (req, res) => {
  res.json({
    monthlyChange: 5.2,
    earnings: 3200,
    earningsChange: 8,
    earningsPercentage: 12,
    spending: 1800,
    spendingChange: -3
  });
});

// 5. Spending categories
router.get("/spending/categories", (req, res) => {
  res.json([
    { name: "Food", amount: 600 },
    { name: "Transport", amount: 300 },
    { name: "Shopping", amount: 900 }
  ]);
});

// 6. AI Insights
router.get("/ai/insights", (req, res) => {
  res.json([
    { id: "i1", text: "Your spending on food increased by 12% this month." },
    { id: "i2", text: "Consider moving extra savings into investments." },
    { id: "i3", text: "You saved 15% more compared to last month. Keep it up!" }
  ]);
});

module.exports = router;
