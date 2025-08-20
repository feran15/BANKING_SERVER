const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Admin = require('../model/Admin')
const AppError = require('../utils/AppError')

// Admin Registration(Signup)
const registerAdmin = async (req, res, next) => {
    try {
        const {username, email, Password} = req.body
        const hashedPassword = await bcrypt.hash(Password, 10)

          const admin = new Admin({ username, email, password: hashedPassword });
    await admin.save();
        res.status(201).json({
            message:"Admin registered Successfully"
        })
    } catch (error) {
        next(error)
    }
}

// Admin Login
const loginAdmin = async (req, res, next) => {
    try{
        const {email, Password} = req.body
        const admin = await Admin.findOne({email})

        if(!admin) return res.status(404).json({
            message:"Admin User not found"
        })

        const Match = await bcrypt.compare(Password, admin.Password);
        if(!Match) return res.status(404).json({
            message:"Invalid Credentials"
        })
        const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, role: admin.role });
    } catch (error) {
        throw new AppError("Login Error", 500)
    }
}