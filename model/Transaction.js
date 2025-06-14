const mongoose = require("mongoose")

const transactionSchema = new mongoose.Schema({
  accountNumber: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
  type: { type: String, enum: ['deposit', 'withdraw', 'transfer'], required: true },
  amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  description: String
});

 module.exports = Transaction = mongoose.model('Transaction', transactionSchema);
