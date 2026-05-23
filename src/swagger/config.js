const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Subscription & Billing API System',
      version: '1.0.0',
      description: 'Production-quality subscription management API with billing lifecycle management',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://api.example.com',
        description: 'Production server',
      },
    ],
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
