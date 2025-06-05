const express = require('express')
const router = require('express').Router()
const User = require('../model/Usermodel')
const AppError = require('../utils/AppError');
const { JsonWebTokenError } = require('jsonwebtoken');

// User Registration
router.post('/register', async (req, res, next) => {
    try {
        // Check if user exist
        const existingUser = await User.findOne({email:req.body.email})
        if(existingUser) {
            return res.status(400).json({message:"User already exist"})
        }
        // Create a new user
        const newUser = new User({
            firstName: req.body.firstName,
            lastName:req.body.lastName,
            Email:req.body.Email,
            Password:req.body.Password
        });
        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedpassword = await bcrypt.hash(req.body.password,salt)
        // Save User
        const savedUser = await newUser.save()
        const {password, ...userWithoutPassword} = savedUser._doc;
        res.status(201).json(userWithoutPassword)
    } catch (error) {
        next(error)
    }
});

// Login 
router.post('/login', async (req, res, next) => {
    try {
        // Check if your exists
        const user = await User.findOne({email:req.body.email})
        if(!user) {
            return res.status(404).json({message:"User not found"})
        }
        // Validate Password
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if(!validPassword) {
            return res.status(400).json({message:'Invalid password'})
        }
        // create Token
        // const token = JsonWebTokenError
        res.status(200).json({
            status:"Success",
            ...userWithoutPassword
        })
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

module.exports = router;