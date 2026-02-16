const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const UserRoutes = require("./routes/UserRoutes.js");
const DashboardRoutes = require("./routes/Dashboard.js");
const TransactionRoutes = require("./routes/TransactionRoutes.js");
// const PaymentRoutes = require("./routes/PaymentModalRoutes.js");
// const AIInsightsRoutes = require("./routes/InsightRoutes.js");
const TransactionPinRoutes = require("./routes/TransactionPinRoutes.js");



dotenv.config();

const app = express();

// ✅ Middleware
app.use(express.json());

// ✅ Define allowed origins
const allowedOrigins = [
  "http://localhost:5173",                 // your dev frontend
  "https://feran159814-wy429h0s.leapcell.dev", // backend itself
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
// app.options("/*", cors());


// ✅ Test route to confirm CORS working
app.get("/test-cors", (req, res) => {
  res.json({ message: "CORS headers working ✅" });
});

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
console.log("MONGO_URI:", process.env.MONGO_URI);


// ✅ Mount Routes
app.use("/api/User", UserRoutes);
app.use("/api/dashboard", DashboardRoutes);
app.use("/api/transactions", TransactionRoutes);
// app.use("/api/payments", PaymentRoutes);
// app.use("/ai/insights", AIInsightsRoutes);
app.use("/api/Pin", TransactionPinRoutes)
// ✅ Root endpoint
app.get("/", (req, res) => {
  res.send("🚀 Banking API is running...");
});

// ✅ Start Server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
