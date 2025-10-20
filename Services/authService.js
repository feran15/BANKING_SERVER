// services/authService.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/Usermodel');
const sendMail = require('../utils/mailer');

class AuthService {
  static generateAccountNumber() {
    const prefix = '2';
    const suffix = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
    return prefix + suffix;
  }

  static async generateUniqueAccountNumber(maxAttempts = 10) {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      const accountNumber = this.generateAccountNumber();
      const existingAccount = await User.findOne({ accountNumber });
      
      if (!existingAccount) {
        return accountNumber;
      }
      attempts++;
    }
    
    throw new Error('Unable to generate unique account number');
  }

  static async hashPassword(password, saltRounds = 12) {
    return await bcrypt.hash(password, saltRounds);
  }

  static async comparePasswords(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static generateToken(user) {
    return jwt.sign(
      { 
        id: user._id,
        email: user.email 
      }, 
      process.env.JWT_SECRET,
      {
        expiresIn: '24h',
        issuer: 'mybank-api',
        audience: 'mybank-client'
      }
    );
  }

  static sanitizeUser(user) {
    const { password, __v, ...userWithoutSensitiveData } = user._doc || user;
    return userWithoutSensitiveData;
  }

  static async sendWelcomeEmail(email, firstName, accountNumber) {
    try {
      await sendMail(
        email,
        'Welcome to MyBank - Account Created Successfully',
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to MyBank, ${firstName}!</h2>
          <p>Your account has been created successfully.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Account Details:</h3>
            <p><strong>Account Number:</strong> ${accountNumber}</p>
            <p><strong>Account Holder:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> ${email}</p>
          </div>
          <p>Please keep your account number safe and use it for all transactions.</p>
          <p>Thank you for choosing MyBank!</p>
        </div>
        `
      );
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't throw error - registration should continue even if email fails
    }
  }
}

module.exports = AuthService;