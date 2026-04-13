const mongoose = require('mongoose');
const colors = require('colors');
const dns = require('dns');

try { dns.setServers(['8.8.8.8', '8.8.4.4']); }
catch { console.warn('Could not set DNS servers, using default.'.yellow); }

// Auto-retry with exponential backoff on initial connect failure,
// plus runtime reconnect listeners so the server survives transient disconnects.
const connectDB = async (attempt = 1) => {
  const MAX_RETRIES = 10;
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      retryWrites: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`.cyan.underline);
  } catch (error) {
    console.error(`❌ MongoDB Error (attempt ${attempt}/${MAX_RETRIES}): ${error.message}`.red.bold);
    if (attempt < MAX_RETRIES) {
      const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
      console.log(`⏳ Retrying in ${delay / 1000}s...`.yellow);
      setTimeout(() => connectDB(attempt + 1), delay);
    } else {
      console.error('❌ Max retries reached. Exiting.'.red.bold);
      process.exit(1);
    }
  }
};

// Runtime listeners — keeps the process alive on transient drops
mongoose.connection.on('disconnected', () => {
  console.warn('⚠  MongoDB disconnected. Mongoose will auto-reconnect…'.yellow);
});
mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected'.cyan);
});
mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB runtime error: ${err.message}`.red);
});

module.exports = connectDB;
