const mongoose = require('mongoose');

const TransactionPinSchema = new mongoose.Schema({
  Pin: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // 💡 Ensures one pin per user
  }
});

module.exports = mongoose.models.Transaction || mongoose.model('Transaction', TransactionPinSchema);
