const mongoose = require("mongoose")

const accountSchema = new mongoose.Schema({
  fullName: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  email: { type: String, unique:true },
  Password: { type: String, enum: ['savings', 'checking'], default: 'savings' },
  bvn: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
  balance: [{type:Number, default: 0}]
});

module.exports = Account = mongoose.model('Account', accountSchema);
