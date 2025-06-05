    const Users = require("../model/Usermodel")
    const mongoose = require('mongoose')
    const AppError = require('../utils/AppError')

    const getAllUsers = async (req, res, next) =>  {
        try {
            const Users = await require("../model/Usermodel")
            const allusers = await Users.find();
            res.status(200).json({
                status:"Success",
                message:"All users retrieved",
                result:allusers.length,
                data:allusers
            })
        } catch (error) {
            next(error)
        }
    };
        const getSingleUSer = async (req, res, next) => {
            try {
                const id = req.params.id
                console.log(id)

                const user = await Users.findById(id)

                if(!user) {
                    throw new AppError("User not found", 404)
                }

                res.status(200).json({
                    status:"Success",
                    message:"User gotten successfully",
                    data:user
                });
            } catch (error) {
                next(error)
            }
        }
            const createNewUser = async (req, res, next) => {
                try {
                    console.log('Incoming request:', req.body)
                    const {firstName, lastName, Email, Password} = req.body
                    if(!firstName || !lastName || !Email || !Password) {
                        throw new AppError("Please fill in all fields", 400)
                    }
                    // Create a new User
                    const newUser = await Users.create({
                        firstName,
                        lastName,
                        Email,
                        Password
                    });
                    res.status(201).json({
                        status:"Success",
                        message:"User created successfully",
                        data: newUser
                    })
                } catch (error) {
                    next(error)
                }
            }

            module.exports = {
                getAllUsers,
                getSingleUSer,
                createNewUser
            }