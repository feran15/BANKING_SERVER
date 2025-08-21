// controllers/adminController.js
const Admin = require("../model/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/mailer"); // optional

const registerAdmin = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) return res.status(400).json({ message: "Admin already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({ username, email, password: hashedPassword, role });
    const savedAdmin = await admin.save();

    // Optional welcome email
    await sendMail(
      email,
      "Welcome Admin",
      `<h2>Hi ${username},</h2><p>Your admin account has been created!</p>`
    );

    const token = jwt.sign({ id: savedAdmin._id, role: savedAdmin.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(201).json({ message: "Admin registered successfully", token, admin: { id: savedAdmin._id, username, email, role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: "All fields are required" });

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: "Password is incorrect" });

    const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(200).json({
      token,
      admin: { id: admin._id, username: admin.username, email: admin.email, role: admin.role }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
module.exports = {
    registerAdmin,
    loginAdmin
}