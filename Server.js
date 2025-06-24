const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
 const cors = require('cors');
 const UserRoutes = require('./routes/UserRoutes');

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Preflight support
// app.options('*', cors());
// Middleware
app.use(express.json());

// Routes
 app.use('/api/User', UserRoutes);

// // Default route
 app.get('/', (req, res) => {
   res.send('Banking API is live 🚀');
 });

// Connect to DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
