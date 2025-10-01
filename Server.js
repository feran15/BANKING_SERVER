const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const UserRoutes = require("./routes/UserRoutes");
const DashboardRoutes = require("./routes/Dashboard")
const TransactionRoutes = require("./routes/TransactionRoutes")
const PaymentRoutes = require("./routes/PaymentRoutes")
require("dotenv").config();


const app = express();

// Middleware
// app.use(cors());
app.use(express.json());
const allowedOrigins = ["http://localhost:5173"]; // add production domain(s) later

app.use(cors({
  origin: allowedOrigins,
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Import routes
const AIInsightsRoutes = require("./routes/InsightRoutes");
const { default: mongoose } = require("mongoose");

// Mount routes
app.use("/ai/insights", AIInsightsRoutes);
app.use("/api/User", UserRoutes)
app.use("/api/dashboard", DashboardRoutes)
app.use("/api/transactions", TransactionRoutes)
app.use("/api/payments", PaymentRoutes)
// Root endpoint
app.get("/", (req, res) => {
  res.send("🚀 Banking API is running...");
});

const PORT = process.env.PORT;

mongoose.connect(process.env.MONGO_URI, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
}).then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.log("MongoDB connection error:", err)
})
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
