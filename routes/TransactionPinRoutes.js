const express = require("express");
const router = express.Router();

const AuthController = require("../controller/authController");
const verifyToken = require("../middleware/auth"); // <-- FIXED

router.post(
  "/set-pin",
  verifyToken,
  AuthController.setTransactionPin
);

router.post(
  "/verify",
  verifyToken,
  AuthController.verifyTransactionPin
);

module.exports = router;
