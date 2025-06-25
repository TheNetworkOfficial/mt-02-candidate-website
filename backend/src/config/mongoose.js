const mongoose = require('mongoose');
require('dotenv').config();

// Only attempt to connect if a MongoDB URI is provided. This allows the
// backend to run in environments where MongoDB is not configured.
if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error', err));
}

module.exports = mongoose;