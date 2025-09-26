const express = require('express');
const router = express.Router();
const sendMail = require('../utils/mailer');
// Password reset request (bonus endpoint)
router.post('/forgot-password', authLimiter, async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Don't reveal if email exists or not for security
    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.'
    });

    // Only send email if user exists
    if (user) {
      const resetToken = jwt.sign(
        { id: user._id, purpose: 'password-reset' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      try {
        await sendMail(
          email,
          'MyBank - Password Reset Request',
          `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>You requested a password reset for your MyBank account.</p>
            <p>Click the link below to reset your password (valid for 1 hour):</p>
            <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}" 
               style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
               Reset Password
            </a>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
          `
        );
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
      }
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    next(error);
  }
});

module.exports = router;