const mongoose = require("mongoose")

const transactionSchema = new mongoose.Schema({
  accountNumber: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
  type: { type: String, enum: ['deposit', 'withdraw', 'transfer'], required: true },
  amount: { type: Number, required: true },
  Pin: { type: Number, required: true },
  description: String
});

 module.exports = Transaction = mongoose.model('Transaction', transactionSchema);
