const express = require("express");
const router = express.Router();
const { transferFunds } = require("../controllers/TransactionController");
const verifyToken = require("../middleware/auth");

router.post("/transfer", verifyToken, transferFunds);

module.exports = router;
