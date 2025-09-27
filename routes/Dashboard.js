// routes/DashboardRoutes.js
const express = require("express");
const router = express.Router();

router.get("/body", async (req, res) => {
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
 
    res.json({ user, transactions, accounts });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Failed to load dashboard data" });
  }
});

module.exports = router;
