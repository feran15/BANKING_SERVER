const express = require("express");
const bcrypt = require('bcryptjs');
const router = express.Router();
const AppError = require('../utils/AppError');

// Register a new Transaction Pin
router.post('/Pin', async (req, res, next) => {
    try{
        const { Pin } = req.body

        // Hash Pin
        const salt = await bcrypt.genSalt(10)
        const hashedPin = await bcrypt.hash(Pin, salt)
    } catch (error) {
        throw new AppError('Please create your transaction pin')
    }
})
module.exports = router;