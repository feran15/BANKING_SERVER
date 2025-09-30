// middleware/authMiddleware.js
const rateLimit = require("express-rate-limit");
const validator = require("validator");
const jwt = require("jsonwebtoken");

// 🔹 Utility to send validation errors
const sendErrors = (res, errors) =>
  res.status(400).json({ success: false, message: "Validation failed", errors });

// 🔹 Rate limiting factory
const createRateLimit = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
  });

// Exported limiters
exports.authLimiter = createRateLimit(
  15 * 60 * 1000,
  20,
  "Too many auth requests. Please try again later."
);
exports.loginLimiter = createRateLimit(
  15 * 60 * 1000,
  10,
  "Too many login attempts. Please try again later."
);

// 🔹 Registration validation
exports.validateRegistration = (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
  const errors = [];

  // Required fields
  if (!firstName?.trim()) errors.push("First name is required");
  if (!lastName?.trim()) errors.push("Last name is required");
  if (!email?.trim()) errors.push("Email is required");
  if (!password) errors.push("Password is required");

  // If required fields failed, return early
  if (errors.length) return sendErrors(res, errors);

  // ✅ Loosened name rules (allow letters, spaces, hyphen, apostrophe, dot)
  const nameRegex = /^[a-zA-Z\s.'-]+$/;
  if (!nameRegex.test(firstName.trim()))
    errors.push("First name contains invalid characters");
  if (!nameRegex.test(lastName.trim()))
    errors.push("Last name contains invalid characters");

  // ✅ Keep simple length rules
  if (firstName.trim().length < 2 || firstName.trim().length > 50)
    errors.push("First name must be 2-50 characters long");
  if (lastName.trim().length < 2 || lastName.trim().length > 50)
    errors.push("Last name must be 2-50 characters long");

  // ✅ Email
  if (!validator.isEmail(email)) errors.push("Please provide a valid email");

  // ✅ Relaxed password rules (only length requirement now)
  if (password.length < 6)
    errors.push("Password must be at least 6 characters long");

  if (errors.length) return sendErrors(res, errors);

  // Sanitized body
  req.sanitizedBody = {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.toLowerCase().trim(),
    password,
  };

  next();
};

// 🔹 Login validation
exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email?.trim()) errors.push("Email is required");
  if (!password) errors.push("Password is required");

  if (!validator.isEmail(email)) errors.push("Please provide a valid email");

  if (errors.length) return sendErrors(res, errors);

  req.sanitizedBody = {
    email: email.toLowerCase().trim(),
    password,
  };

  next();
};

// 🔹 Auth token verification
exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};
