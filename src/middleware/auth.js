const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { formatErrorResponse } = require('../utils/responseFormatter');

/**
 * Middleware to verify JWT token and attach user to request
 * All protected routes should use this middleware
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(
        formatErrorResponse('No token provided or invalid format', 401)
      );
    }

    const token = authHeader.slice(7); // Remove "Bearer " prefix

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json(
          formatErrorResponse('Token has expired', 401)
        );
      }
      return res.status(401).json(
        formatErrorResponse('Invalid token', 401)
      );
    }

    // Get user from database
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json(
        formatErrorResponse('User not found', 401)
      );
    }

    if (!user.isActive) {
      return res.status(403).json(
        formatErrorResponse('User account is inactive', 403)
      );
    }

    // Attach user to request
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(500).json(
      formatErrorResponse('Internal server error during authentication', 500)
    );
  }
};

module.exports = {
  authenticateToken,
};
