const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

// 1. Bulletproof .env loading using an absolute path
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const seedUsers = async () => {
  try {
    // 2. The Google DNS bypass to fix the ECONNREFUSED error
    try {
      dns.setServers(['8.8.8.8', '8.8.4.4']);
    } catch (error) {
      // silently fail and use default if it can't set
    }

    // Ensure MONGO_URI exists, otherwise throw an error instead of using localhost
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is undefined. The .env file was not loaded correctly.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const User = require('../models/User');
    await User.deleteMany();

    const users = [
      { name: 'Admin User', email: 'admin@shopwave.com', password: 'Admin@123', role: 'admin', isEmailVerified: true },
      { name: 'John Doe', email: 'john@example.com', password: 'User@123', role: 'user', isEmailVerified: true },
      { name: 'Jane Smith', email: 'jane@example.com', password: 'User@123', role: 'user', isEmailVerified: true },
    ];

    for (const userData of users) {
      await User.create(userData);
    }
    console.log('✅ Users seeded!');
    console.log('Admin: admin@shopwave.com / Admin@123');
    console.log('User:  john@example.com / User@123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

seedUsers();