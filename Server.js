const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const UserRoutes = require('./routes/UserRoutes'); // your routes here
const cors = require('cors')
dotenv.config();

const app = express();

// Built-in middleware (not custom)
app.use(express.json()); // Body parser

// Routes
app.use('/api/User', UserRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Banking API is live 🚀');
});
// Explicitly allows frontEnd
 app.use(cors({
    origin: 'http://localhost:5173', // Explicitly allow frontend
    credentials: true,
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization'[[[[[[[[]]]]]]]],
  }));

// Connect to DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
