const express = require("express")
const AppError = require ("../utils/AppEror")
const Account = require("../model/Account")

// Get all client's details
const getAllBankAccount = async (req, res, next) => {
    try{
        const allBankAccount = await Account.find();
        res.json({
              status:"Success",
            message:"All Bank accounts fetched successfully",
            result:allBankAccount.length,
            data: allBankAccount
        })
    } catch (error) {
        throw new AppError("Something went Wrong", 400)
    }
}

// Create a new Account
    const newAccount =  async (req, res, next) => {
        try{
        const {fullName, email, Password, bvn,} = req.body
        if(!fullName || !email || !Password || !bvn) {
        throw new AppError("Please fill in neccessary fields", 400)
        };

        // Hash the user bvn
        const hashedbvn = await bcrypt.hash(bvn, 10)

        const newAccount = await Account.create ({
            fullName,
            email,
            Password,
            bvn:hashedbvn
        });
        res.status(200).json({
            status:"Sucess",
            message:"Bank Account created Successfully",
            data:newAccount
        })
        } catch (error) {
            next(error)
        }
    }

    module.exports = {
        getAllBankAccount,
        newAccount
    }