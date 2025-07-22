const mongoose = require('mongoose')

const TransactionPinSchema = new mongoose.Schema ({
    Pin: {type:Number, required:true}
})

module.exports = TransactionPin = mongoose.model('Transaction', TransactionPinSchema)