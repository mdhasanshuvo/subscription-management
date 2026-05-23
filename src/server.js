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

// Security middleware with custom CSP for Swagger UI
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https://"],
      fontSrc: ["'self'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
    },
  },
}));

// Logging middleware
app.use(morgan('combined'));

// CORS middleware
const corsOrigin = process.env.NODE_ENV === 'production' 
  ? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '*')
  : '*';

app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ====== SWAGGER SETUP ======
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerSpec = require('./swagger/config');

const swaggerOptions = {
  customCss: `
    .topbar { display: none; }
    .swagger-ui .topbar { display: none; }
  `,
  customSiteTitle: 'Subscription & Billing API',
  swaggerOptions: {
    persistAuthorization: true,
    displayOperationId: true,
    filter: true,
    showRequestHeaders: true,
  },
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));

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
      console.log('\n' + '='.repeat(60));
      console.log('✓ Server started successfully');
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`✓ Environment: ${process.env.NODE_ENV}`);
      console.log('='.repeat(60));
      console.log('\n🔐 DEFAULT TEST CREDENTIALS FOR RECRUITERS:');
      console.log('━'.repeat(60));
      console.log('\n👨‍💼 ADMIN ACCOUNT:');
      console.log('   Email:    admin@example.com');
      console.log('   Password: admin123456');
      console.log('   Role:     admin (full access)');
      console.log('\n👤 USER ACCOUNT:');
      console.log('   Email:    user@example.com');
      console.log('   Password: user123456');
      console.log('   Role:     user (standard access)');
      console.log('\n' + '━'.repeat(60) + '\n');
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
