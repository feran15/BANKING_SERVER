
const express = require("express");
const router = express.Router();
const AuthController = require("../controller/authController");
const verifyToken = require("../middleware/auth");

router.post("/set-pin", verifyToken, AuthController.setTransactionPin);

module.exports = router;
