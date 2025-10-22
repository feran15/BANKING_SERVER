const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, "Please provide a valid email"],
    unique: [true, "User with email exists"],
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [8, "Password must be at least 8 characters long"]
  },
  accountNumber: {
    type: String,
    unique: true,
    required: true
  },
  transactionPin: {
  type: String,
  default: null
}
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
