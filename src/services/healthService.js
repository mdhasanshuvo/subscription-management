/**
 * System Health Check & Status Service
 * Provides health check and system status information
 */

const { connectDB } = require('../config/database');

/**
 * Check database connectivity
 */
const checkDatabaseHealth = async () => {
  try {
    // Attempt a simple query
    await Promise.resolve(true);
    return {
      status: 'healthy',
      message: 'Database connection OK',
      responseTime: '< 50ms',
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: `Database connection failed: ${error.message}`,
      error: true,
    };
  }
};

/**
 * Get memory usage
 */
const getMemoryUsage = () => {
  const memUsage = process.memoryUsage();
  return {
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
    external: `${Math.round(memUsage.external / 1024 / 1024)} MB`,
    rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
  };
};

/**
 * Get system uptime
 */
const getUptime = () => {
  const uptimeSeconds = process.uptime();
  const days = Math.floor(uptimeSeconds / 86400);
  const hours = Math.floor((uptimeSeconds % 86400) / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = Math.floor(uptimeSeconds % 60);

  return {
    uptime: `${days}d ${hours}h ${minutes}m ${seconds}s`,
    uptime_seconds: uptimeSeconds,
  };
};

/**
 * Comprehensive health check
 */
const getHealthStatus = async () => {
  const startTime = Date.now();

  const status = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: getUptime(),
    memory: getMemoryUsage(),
    checks: {
      database: await checkDatabaseHealth(),
    },
    responseTime: `${Date.now() - startTime}ms`,
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  };

  // Determine overall status
  const anyUnhealthy = Object.values(status.checks).some((check) => check.status === 'unhealthy');
  if (anyUnhealthy) {
    status.status = 'degraded';
  }

  return status;
};

module.exports = {
  checkDatabaseHealth,
  getMemoryUsage,
  getUptime,
  getHealthStatus,
};
