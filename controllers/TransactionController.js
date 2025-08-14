const Account = require("../model/Account");
const Transaction = require("../model/Transaction");
const bcrypt = require("bcryptjs");

const transferFunds = async (req, res) => {
  const { toAccountNumber, amount, pin } = req.body;
  const userId = req.user.id;

  try {
    const senderAccount = await Account.findOne({ user: userId }).populate("user");
    if (!senderAccount) return res.status(404).json({ message: "Sender account not found" });

    const isPinValid = await bcrypt.compare(pin, senderAccount.user.transactionPin);
    if (!isPinValid) return res.status(401).json({ message: "Invalid transaction PIN" });

    const recipientAccount = await Account.findOne({ accountNumber: toAccountNumber });
    if (!recipientAccount) return res.status(404).json({ message: "Recipient account not found" });

    if (senderAccount.balance < amount) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    // Update balances
    senderAccount.balance -= amount;
    recipientAccount.balance += amount;
    await senderAccount.save();
    await recipientAccount.save();

    // Record transaction
    const transaction = new Transaction({
      from: senderAccount._id,
      to: recipientAccount._id,
      amount,
      type: "transfer",
    });
    await transaction.save();

    res.status(200).json({ message: "Transfer successful", transaction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { transferFunds };
