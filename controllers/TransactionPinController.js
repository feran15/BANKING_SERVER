const bcrypt = require('bcryptjs');
const AppError = require('../utils/AppError');
const TransactionPin = require('../model/TransactionPin');

const newTransactionPin = async (req, res, next) => {
  try {
    const { Pin } = req.body;

    if (!Pin) {
      throw new AppError("Please provide a transaction pin", 400);
    }

    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized access", 401);
    }

    // Hash the new pin
    const hashedPin = await bcrypt.hash(Pin, 10);

    // Check if the user already has a pin
    const existingPin = await TransactionPin.findOne({ userId });

    if (existingPin) {
      // Update existing pin
      existingPin.Pin = hashedPin;
      await existingPin.save();
      return res.status(200).json({
        status: "Success",
        message: "Transaction pin updated successfully"
      });
    } else {
      // Create new pin
      const newPin = new TransactionPin({
        Pin: hashedPin,
        userId
      });
      await newPin.save();
      return res.status(200).json({
        status: "Success",
        message: "Transaction pin created successfully"
      });
    }

  } catch (error) {
    next(error);
  }
};

module.exports = { newTransactionPin };
