
const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");
const verifyToken = require("../middleware/auth");

router.post("/set-pin", verifyToken, AuthController.setTransactionPin);

module.exports = router;
