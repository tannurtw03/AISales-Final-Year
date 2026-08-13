const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smartsalesai';
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
    console.log(`[MongoDB] Connected to Primary Database: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB Warning] Could not connect to primary URI (${error.message}). Initializing MongoMemoryServer fallback...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create({
        binary: { version: '6.0.5' }
      });
      const mongoUri = mongoServer.getUri();
      const conn = await mongoose.connect(mongoUri);
      console.log(`[MongoDB] Connected to In-Memory Database Engine: ${mongoUri}`);

      // Auto Seed In-Memory Database
      const seedDatabaseInline = require('../utils/seedInline');
      await seedDatabaseInline();

      return conn;
    } catch (memError) {
      console.error(`[MongoDB Error] Failed to initialize database: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
