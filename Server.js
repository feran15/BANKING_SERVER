const express = require('express')
const mongoose = require('mongoose')
const app = express()
require('dotenv').config()

// Database Connection
    mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to DB successfully"))
    .catch((err) => console.log("MongoDB connection error:", err))

// Start Server
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})