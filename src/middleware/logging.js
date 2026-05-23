/**
 * Request & Response Logging Middleware
 * Logs incoming requests and outgoing responses for debugging
 */

const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Store original send method
  const originalSend = res.send;

  // Override send to capture response
  res.send = function (data) {
    const responseTime = Date.now() - startTime;

    // Log request and response
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
        userId: req.user?._id || 'anonymous',
        ip: req.ip,
      })
    );

    // Call the original send method
    return originalSend.call(this, data);
  };

  next();
};

module.exports = {
  requestLogger,
};
