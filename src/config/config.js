/**
 * Configuration Management
 * Centralized configuration for different environments
 */

const config = {
  development: {
    // Server
    port: process.env.PORT || 5000,
    nodeEnv: 'development',

    // Database
    mongoUri: process.env.MONGODB_URI,
    mongoPoolSize: 10,

    // JWT
    jwtSecret: process.env.JWT_SECRET,
    jwtExpire: process.env.JWT_EXPIRE || '7d',

    // Security
    webhookSecret: process.env.WEBHOOK_SECRET,
    bcryptRounds: 10,

    // API
    corsOrigin: '*',
    rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
    rateLimitMaxRequests: 1000, // requests per window

    // Features
    enableLogging: true,
    enableSwagger: true,
    enableMetrics: false,

    // Defaults
    defaultPaginationLimit: 50,
    maxPaginationLimit: 500,
    auditLogRetentionDays: 365,
  },

  production: {
    // Server
    port: process.env.PORT || 3000,
    nodeEnv: 'production',

    // Database
    mongoUri: process.env.MONGODB_URI,
    mongoPoolSize: 20,

    // JWT
    jwtSecret: process.env.JWT_SECRET,
    jwtExpire: process.env.JWT_EXPIRE || '7d',

    // Security
    webhookSecret: process.env.WEBHOOK_SECRET,
    bcryptRounds: 12, // Higher rounds for production

    // API
    corsOrigin: process.env.VERCEL_URL || 'https://api.example.com',
    rateLimitWindowMs: 15 * 60 * 1000,
    rateLimitMaxRequests: 1000,

    // Features
    enableLogging: true,
    enableSwagger: false, // Don't expose Swagger in production
    enableMetrics: true,

    // Defaults
    defaultPaginationLimit: 50,
    maxPaginationLimit: 500,
    auditLogRetentionDays: 365,
  },

  test: {
    // Server
    port: 5001,
    nodeEnv: 'test',

    // Database
    mongoUri: 'mongodb://localhost:27017/subscription-test',
    mongoPoolSize: 1,

    // JWT
    jwtSecret: 'test-secret-key',
    jwtExpire: '1h',

    // Security
    webhookSecret: 'test-webhook-secret',
    bcryptRounds: 4, // Faster for tests

    // API
    corsOrigin: '*',
    rateLimitWindowMs: 60 * 1000,
    rateLimitMaxRequests: 10000,

    // Features
    enableLogging: false,
    enableSwagger: true,
    enableMetrics: false,

    // Defaults
    defaultPaginationLimit: 10,
    maxPaginationLimit: 100,
    auditLogRetentionDays: 7,
  },
};

// Validate required environment variables
const validateConfig = (environment) => {
  const requiredVars = ['jwtSecret', 'mongoUri', 'webhookSecret'];

  const missingVars = requiredVars.filter(
    (varName) => !config[environment][varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
};

// Get configuration for current environment
const getConfig = () => {
  const env = process.env.NODE_ENV || 'development';

  if (!config[env]) {
    throw new Error(`Unknown environment: ${env}`);
  }

  // Validate before returning
  validateConfig(env);

  return config[env];
};

module.exports = {
  config,
  getConfig,
  validateConfig,
};
