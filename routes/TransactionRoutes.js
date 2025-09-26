const express = require("express");
const axios = require("axios");

const router = express.Router();

// Input validation middleware
const validatePaymentVerification = (req, res, next) => {
  const { reference } = req.body;
  
  if (!reference) {
    return res.status(400).json({
      success: false,
      message: "Payment reference is required"
    });
  }
  // Get all Transaction
  
  
  // Basic reference format validation (Paystack references are typically alphanumeric)
  if (!/^[a-zA-Z0-9_-]+$/.test(reference)) {
    return res.status(400).json({
      success: false,
      message: "Invalid reference format"
    });
  }
  
  next();
};

// Verify payment route
router.post("/payment/verify", validatePaymentVerification, async (req, res) => {
  const { reference } = req.body;

  // Check if Paystack secret key is configured
  if (!process.env.PAYSTACK_SECRET_KEY) {
    console.error("PAYSTACK_SECRET_KEY environment variable not set");
    return res.status(500).json({
      success: false,
      message: "Payment service configuration error"
    });
  }

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      }
    );

    const { data: paystackData } = response.data;

    // More comprehensive status checking
    if (response.data.status === true && paystackData.status === "success") {
      // Additional validation: check if payment was actually completed
      if (paystackData.gateway_response === "Successful") {
        return res.json({
          success: true,
          message: "Payment verified successfully",
          data: {
            reference: paystackData.reference,
            amount: paystackData.amount / 100, // Convert from kobo to naira
            currency: paystackData.currency,
            customer: {
              email: paystackData.customer.email,
              customer_code: paystackData.customer.customer_code
            },
            paid_at: paystackData.paid_at,
            channel: paystackData.channel,
            gateway_response: paystackData.gateway_response
          }
        });
      } else {
        return res.status(400).json({
          success: false,
          message: `Payment not successful: ${paystackData.gateway_response}`,
          data: {
            reference: paystackData.reference,
            status: paystackData.status,
            gateway_response: paystackData.gateway_response
          }
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
        data: {
          reference: paystackData?.reference || reference,
          status: paystackData?.status || "unknown",
          message: response.data.message || "Verification unsuccessful"
        }
      });
    }

  } catch (error) {
    console.error("Payment verification error:", {
      reference,
      error: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    // Handle different types of errors
    if (error.response) {
      // Paystack API returned an error response
      const statusCode = error.response.status;
      const errorMessage = error.response.data?.message || "Payment verification failed";
      
      if (statusCode === 404) {
        return res.status(404).json({
          success: false,
          message: "Transaction not found",
          reference
        });
      } else if (statusCode === 401) {
        return res.status(500).json({
          success: false,
          message: "Payment service authentication error"
        });
      } else {
        return res.status(400).json({
          success: false,
          message: errorMessage,
          reference
        });
      }
    } else if (error.code === 'ECONNABORTED') {
      // Timeout error
      return res.status(408).json({
        success: false,
        message: "Payment verification request timed out"
      });
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      // Network error
      return res.status(503).json({
        success: false,
        message: "Payment service temporarily unavailable"
      });
    } else {
      // Generic error
      return res.status(500).json({
        success: false,
        message: "Internal server error during payment verification"
      });
    }
  }
});

// Optional: Route to get transaction details (for admin purposes)
router.get("/payment/transaction/:reference", async (req, res) => {
  const { reference } = req.params;
  
  if (!reference) {
    return res.status(400).json({
      success: false,
      message: "Transaction reference is required"
    });
  }

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    return res.json({
      success: true,
      data: response.data.data
    });

  } catch (error) {
    console.error("Transaction fetch error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch transaction details"
    });
  }
});

module.exports = router;