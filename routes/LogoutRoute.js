// LOGOUT (optional - for token blacklisting)
const express = require('express');
const router = express.Router();

router.post('/logout', async (req, res) => {
  try {
    // In a production app, you might want to blacklist the token
    // or store logout timestamp to invalidate tokens issued before logout
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});
module.exports = router;