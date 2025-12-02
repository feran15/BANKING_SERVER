const User = require("../model/Usermodel");

// Verify recipient by account number
class UserController {
  static async verifyRecipient(req, res) {
    try {
      const { accountNumber } = req.params;

      // Validate account number format
      if (!/^\d{10}$/.test(accountNumber)) {
        return res.status(400).json({ success: false, message: "Invalid account number" });
      }

      const user = await User.findOne({ accountNumber }).select("firstName lastName accountNumber");

      if (!user) {
        return res.status(404).json({ success: false, message: "Recipient not found" });
      }

      // Return safe data only
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          accountNumber: user.accountNumber,
        },
      });
    } catch (err) {
      console.error("Error verifying recipient:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
}

module.exports = UserController;
