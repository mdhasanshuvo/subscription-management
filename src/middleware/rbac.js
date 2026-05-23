const { formatErrorResponse } = require('../utils/responseFormatter');

/**
 * RBAC Middleware: Check if user has required role(s)
 * Usage: authorizeRole('admin') or authorizeRole('admin', 'moderator')
 */
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    // Ensure user is authenticated first
    if (!req.user) {
      return res.status(401).json(
        formatErrorResponse('User not authenticated', 401)
      );
    }

    // Check if user's role is in allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json(
        formatErrorResponse(
          `Access denied. Required role(s): ${roles.join(', ')}`,
          403
        )
      );
    }

    next();
  };
};

/**
 * Middleware to check if user owns the resource or is admin
 * Useful for personal subscription management
 */
const authorizeResourceOwner = (resourceOwnerId) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(
        formatErrorResponse('User not authenticated', 401)
      );
    }

    // Admin can access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    // User can only access their own resource
    if (req.user._id.toString() !== resourceOwnerId) {
      return res.status(403).json(
        formatErrorResponse('You do not have permission to access this resource', 403)
      );
    }

    next();
  };
};

module.exports = {
  authorizeRole,
  authorizeResourceOwner,
};
