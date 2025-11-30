const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const expenseRoutes = require('./routes/expenses');
// Debug: validate that the required `expenseRoutes` is an Express router/function
if (!expenseRoutes || (typeof expenseRoutes !== 'function' && typeof expenseRoutes !== 'object')) {
  console.error('Invalid `expenseRoutes` export:', typeof expenseRoutes, expenseRoutes);
} else {
  // If it's an object, inspect keys to help debugging
  if (typeof expenseRoutes === 'object') {
    console.log('expenseRoutes object keys:', Object.keys(expenseRoutes));
  }
  app.use('/api/expenses', expenseRoutes);
}

// Build or read MongoDB connection URI
const buildMongoUri = () => {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  const user = process.env.MONGODB_USER;
  const pass = process.env.MONGODB_PASSWORD && encodeURIComponent(process.env.MONGODB_PASSWORD);
  const host = process.env.MONGODB_HOST; // e.g. cluster0.wbuyhpw.mongodb.net
  const db = process.env.MONGODB_DB || 'test';
  if (user && pass && host) return `mongodb+srv://${user}:${pass}@${host}/${db}?retryWrites=true&w=majority`;
  return null;
};

const mongoUri = buildMongoUri();
if (!mongoUri) {
  console.error('MongoDB URI not provided. Set MONGODB_URI (or MONGODB_USER/MONGODB_PASSWORD/MONGODB_HOST) in .env');
  process.exit(1);
}

const safeUri = mongoUri.replace(/:[^:@]+@/, ':<PASSWORD>@');
console.log('Connecting to MongoDB (sanitized):', safeUri);

mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.send('ExpenseTracker API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});