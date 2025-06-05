const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
        firstName:{
            type:String,
            required:true
        },
        lastName:{
            type:String,
            required:true
        },
        Email:{
            type:String,
            required:[true, "Please provide a valid email"],
            unique:[true, "User with email exist"]
        },
        Password:{
            type:String,
            required:[true, "Please provide a password"],
            minLength:[8,"Password must be at least 8 characters long"]
        }
})

const Users = mongoose.model("Users", userschema)

module.exports = Users;