const mongoose = require("mongoose")

const accountSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  balance: { type: Number, default: 0 },
  accountType: { type: String, enum: ['savings', 'checking'], default: 'savings' },
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }]
});

module.exports = Account = mongoose.model('Account', accountSchema);
