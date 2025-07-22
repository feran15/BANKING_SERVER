const express = require('express');
const bcrypt = require('bcryptjs');
const AppEror = require('../utils/AppError');
const TransactionPin = require ('../model/TransactionPin');
// Create a new Transaction Pin
const newTransactionPin = async (req, res, next) => {
    try{
        const {Pin} = req.body;
        if(!Pin) {
            throw new AppEror("please create your transaction Pin", 400)
        }

        // Hash the pin
        const hashedPin = await bcrypt.hash(Pin, 10)
        res.status(200).json({
            status: "Success",
            message:"Pin created Successfully"
        })
    } catch(error) {
        next(error)
    }
}
