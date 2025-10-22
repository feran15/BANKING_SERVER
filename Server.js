const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const UserRoutes = require("./routes/UserRoutes.js");
const DashboardRoutes = require("./routes/Dashboard.js");
const TransactionRoutes = require("./routes/TransactionRoutes.js");
const PaymentRoutes = require("./routes/PaymentRoutes.js");
const AIInsightsRoutes = require("./routes/InsightRoutes.js");


dotenv.config();

const app = express();

// ✅ Middleware
app.use(express.json());

// ✅ Define allowed origins
const allowedOrigins = [
  "http://localhost:5173",                 // your dev frontend
  "https://bankingserver-production.up.railway.app", // backend itself
  "https://your-frontend-domain.com",      // add deployed frontend later
];

// ✅ Dynamic origin handler
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("❌ CORS blocked origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// ✅ Handle preflight requests (OPTIONS)
app.options("*", cors());

// ✅ Test route to confirm CORS working
app.get("/test-cors", (req, res) => {
  res.json({ message: "CORS headers working ✅" });
});

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Mount Routes
app.use("/ai/insights", AIInsightsRoutes);
app.use("/api/User", UserRoutes);
app.use("/api/dashboard", DashboardRoutes);
app.use("/api/transactions", TransactionRoutes);
app.use("/api/payments", PaymentRoutes);

// ✅ Root endpoint
app.get("/", (req, res) => {
  res.send("🚀 Banking API is running...");
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
