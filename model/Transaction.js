const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const transactionSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
  to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },   
  transactionId: {
    type: String,
    default: () => uuidv4(),
  },
  type: { type: String },
  amount: { type: Number },
  description: { type: String },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Transaction", transactionSchema);
