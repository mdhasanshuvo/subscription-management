require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { connectDB } = require('./config/database');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const planRoutes = require('./routes/plans');
const subscriptionRoutes = require('./routes/subscriptions');
const webhookRoutes = require('./routes/webhooks');
const analyticsRoutes = require('./routes/analytics');

// Initialize Express app
const app = express();

// ====== MIDDLEWARE SETUP ======

// Security middleware
app.use(helmet());

// Logging middleware
app.use(morgan('combined'));

// CORS middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.VERCEL_URL : '*',
  credentials: true,
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ====== SWAGGER SETUP ======
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerSpec = require('./swagger/config');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ====== HEALTH CHECK ======
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date(),
    environment: process.env.NODE_ENV,
  });
});

// ====== ROUTES SETUP ======
app.use('/api/auth', authRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/analytics', analyticsRoutes);

// ====== ERROR HANDLING ======
app.use(notFoundHandler);
app.use(errorHandler);

// ====== SERVER START ======
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start Express server
    app.listen(PORT, () => {
      console.log('\n✓ Server started successfully');
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`✓ Environment: ${process.env.NODE_ENV}\n`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n✓ SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n✓ SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
