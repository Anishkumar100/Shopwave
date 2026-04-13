const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
const colors = require('colors');

const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const promotionRoutes = require('./routes/promotionRoutes');
const uploadRoutes = require('./routes/uploadRoutes');


connectDB();

const app = express();

// Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 200,
  message: 'Too many requests from this IP, please try again later.',
});

// Middleware
app.use(helmet());
app.use(limiter);
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/upload', uploadRoutes);

// Health check

app.get('/', (req, res) => {
  res.send('ShopWave API is running perfectly on Vercel!');
});



app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'ShopWave API is running', timestamp: new Date() });
});


// Error Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n${'='.repeat(50)}`.cyan);
  console.log(`🚀 ShopWave Server running on PORT ${PORT}`.green.bold);
  console.log(`📦 Environment: ${process.env.NODE_ENV}`.yellow);
  console.log(`${'='.repeat(50)}\n`.cyan);
});


process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err?.message || err}`.red);
  console.error(err?.stack);
  // DO NOT exit — keeps dev server alive through transient errors.
  // In production you'd want a proper process manager (pm2, systemd) to restart.
});
process.on('uncaughtException', (err) => {
  console.error(`❌ Uncaught Exception: ${err?.message || err}`.red);
  console.error(err?.stack);
});

// VERCEL REQUIREMENT: Export the app so serverless functions can use it
module.exports = app;