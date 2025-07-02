const mongoose = require('mongoose')
const AppError = require('../utils/AppError')
const Transaction = require('../model/Transaction')
const bcrypt = require('bcrypt.js')
// Get all transactions
const  getAllTransactions = async (req, res, next) => {
    try{
        const allTransactions = await Transaction.find();
        res.status(200).json({
            status:"Success",
            message:"All Transactions fetched successfully",
            result:allTransactions.length,
            data: allTransactions
        })
    } catch (error) {
        next(error)
    };
};
// Make new transfer
const newTransfer = async (req, res, next) => {
    try{
        console.log('Incoming request:', req.body);
        const {accountNumber, amount, timestamp} = req.body
        if(!accountNumber || !amount || !Pin) {
            throw new AppError("Pls fill in the adequate fields", 400)
        };

        // Hash the client's pin
        const hashedPin = await bcrypt.hash(Pin, 10)

        const newTransfer = await Transaction.create({
            accountNumber,
            amount,
            Pin:hashedPin
        });
        res.status(200).json({
            status:"success",
            message:"Transaction Successful",
            data:newTransfer

        });
    } catch(error) {
        next(error)
    };
};