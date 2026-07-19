const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.warn('\n================================================================');
    console.warn('⚠️  MONGODB_URI is not configured in backend/.env.');
    console.warn('⚡ Running in HIGH-FIDELITY DEMO MODE (Local In-Memory Mock DB).');
    console.warn('================================================================\n');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.warn('⚠️ Falling back to DEMO MODE due to database connection failure.');
    return false;
  }
};

module.exports = connectDB;
