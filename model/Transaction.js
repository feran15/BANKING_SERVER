const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  // sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  // receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  accountNumber:{type:mongoose.Schema.Types.ObjectId, },
  status: { type: String, default: "pending" },
}, { timestamps: true });

module.exports = mongoose.model("Transaction", TransactionSchema);

