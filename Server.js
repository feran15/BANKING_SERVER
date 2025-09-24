const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const AIInsightsRoutes = require("./routes/InsightRoutes");
const { default: mongoose } = require("mongoose");

// Mount routes
app.use("/ai/insights", AIInsightsRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.send("🚀 Banking API is running...");
});

const PORT = process.env.PORT;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.log("MongoDB connection error:", err)
})
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
