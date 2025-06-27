const express = require('express')
const router = express.router()
// const bcrypt = require('bcryptjs')
const Transaction = require('../model/Transaction')
const { verifyToken } = require('../middleware/auth')

router.get("/", async (req, res) => {
    const transactions = await Transaction.find({user: req.user.id}) 
    .sort({date: -1})
    .limit(20)
    res.json(transactions)
})
export default router