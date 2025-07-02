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
    const newAccount =  async (req, res) => {
        
    }