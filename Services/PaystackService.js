const axios = require("axios");

const paystack = axios.create({
  baseURL: "https://api.paystack.co",
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, // from .env
    "Content-Type": "application/json",
  },
});

// Initialize transaction
exports.initializePayment = async ({ email, amount }) => {
  const response = await paystack.post("/transaction/initialize", {
    email,
    amount: amount * 100, // Paystack expects amount in kobo
  });
  return response.data;
};

// Verify transaction
exports.verifyPayment = async (reference) => {
  const response = await paystack.get(`/transaction/verify/${reference}`);
  return response.data;
};
