const express = require ("express")
const router = express.Router()
const Account = require("../model/Account")
const AppError = require("../utils/AppError")
const bcrypt = require ('bcryptjs')
// Register a new bank account
router.post("/newbank", async (req, res, next) => {
    const {fullname, email, bvn, password,} = req.body
    if(!fullname || !email || !bvn || !password) {
        res.status(400).json({message:"Missing required fields"})
    }
    // checking if account exists
    const existingAccount = await Account.findOne({bvn, email})
    if (existingAccount) {
        res.status(400).json({message:"Bank Account already exists"})
    }
    // Hash bvn and password
    const salt = await bcrypt.genSalt(10);
    const hashedbvn = await bcrypt.hash(bvn, salt)
    const hashedpassword = await bcrypt.hash(password, salt)
    // create a new bank account
    const newAccount = new Account ({
        fullname,
        email,
        bvn:hashedbvn,
        password:hashedpassword
    })
})
module.exports = router;