const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  accountNumber: {
    type: String,
    unique: true,
    required: true
  },
  balance: {
    type: Number,
    default: 0
  },
  accountType: {
    type: String,
    enum: ['savings', 'current'],
    default: 'savings'
  }
}, { timestamps: true });

module.exports = mongoose.models.Account || mongoose.model('Account', AccountSchema);

