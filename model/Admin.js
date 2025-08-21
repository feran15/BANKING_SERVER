const mongoose = require('mongoose')


const adminSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    Password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:["Superadmin","Staff"], 
        default:"Staff"
    }
},
{timestamps:true}
)
module.exports = mongoose.model("Admin", adminSchema)