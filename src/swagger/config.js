const swaggerJsdoc = require('swagger-jsdoc');

const getServers = () => {
  const servers = [];
  
  // Add production server if VERCEL_URL is set
  if (process.env.VERCEL_URL) {
    servers.push({
      url: `https://${process.env.VERCEL_URL}`,
      description: 'Production server (Vercel)',
    });
  }
  
  // Add development server
  servers.push({
    url: 'http://localhost:5000',
    description: 'Development server (Local)',
  });
  
  return servers;
};

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Subscription & Billing API System',
      version: '1.0.0',
      description: `Production-quality subscription management API with billing lifecycle management.
      
🔐 DEFAULT TEST CREDENTIALS FOR RECRUITERS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👨‍💼 ADMIN ACCOUNT:
   Email: admin@example.com
   Password: admin123456
   Role: admin (full access to analytics, plan management, audit logs)

👤 USER ACCOUNT:
   Email: user@example.com
   Password: user123456
   Role: user (can purchase, upgrade, downgrade subscriptions)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use the Login endpoint to get a JWT token, then use it in the Authorization header for protected endpoints.`,
      contact: {
        name: 'API Support',
      },
    },
    servers: getServers(),
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['user', 'admin'] },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        SubscriptionPlan: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            planName: { type: 'string' },
            price: { type: 'number' },
            durationInDays: { type: 'number' },
            features: { type: 'array', items: { type: 'string' } },
            activeStatus: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Subscription: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { type: 'string' },
            plan: { type: 'string' },
            priceAtPurchase: { type: 'number' },
            startDate: { type: 'string', format: 'date-time' },
            expiryDate: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['active', 'expired', 'cancelled', 'upgraded', 'downgraded'] },
            autoRenew: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            statusCode: { type: 'number' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/routes/*.js',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
