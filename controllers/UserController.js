const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../model/Usermodel'); // Only import once
const AppError = require('../utils/AppError');

// GET all users
const getAllUsers = async (req, res, next) => {
  try {
    const allUsers = await User.find();
    res.status(200).json({
      status: "Success",
      message: "All users retrieved",
      result: allUsers.length,
      data: allUsers
    });
  } catch (error) {
    next(error);
  }
};

// GET single user by ID
const getSingleUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json({
      status: "Success",
      message: "User retrieved successfully",
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// POST create new user
const createNewUser = async (req, res, next) => {
  try {
    console.log('Incoming request:', req.body);
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      throw new AppError("Please fill in all fields", 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
      // Auto Generate Account Number
      const generateAccountNumber = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000); // 10-digit number
};

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      accountNumber: generateAccountNumber()
    });

    res.status(201).json({
      status: "Success",
      message: "User created successfully",
      data: newUser
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getSingleUser,
  createNewUser
};
