const Account = require("../model/Account");
const AppError = require("../utils/AppError");
const generateAccountNumber = require("../utils/generateAccountNumber");

// Get all bank accounts
const getAllBankAccount = async (req, res, next) => {
  try {
    const allBankAccounts = await Account.find().populate('userId', 'fullName email');
    res.status(200).json({
      status: "Success",
      message: "All bank accounts fetched successfully",
      result: allBankAccounts.length,
      data: allBankAccounts
    });
  } catch (error) {
    next(new AppError("Something went wrong while fetching accounts", 500));
  }
};

// Create a new bank account for logged-in user
const newAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Check if user already has an account
    const existingAccount = await Account.findOne({ userId });
    if (existingAccount) {
      throw new AppError("User already has a bank account", 400);
    }

    // Generate 10-digit account number
    const accountNumber = generateAccountNumber();

    const newAccount = await Account.create({
      userId,
      accountNumber,
      accountType: "savings" // or get from req.body if needed
    });

    res.status(201).json({
      status: "Success",
      message: "Bank account created successfully",
      data: newAccount
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBankAccount,
  newAccount
};
