const express = require("express");
const { initializePayment, verifyPayment } = require("../Services/PaystackService");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Initialize payment
router.post("/pay", authenticateToken, async (req, res) => {
  try {
    const { email, amount } = req.body;
    const data = await initializePayment({ email, amount });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// Verify payment
router.get("/verify/:reference", authenticateToken, async (req, res) => {
  try {
    const data = await verifyPayment(req.params.reference);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

module.exports = router;
