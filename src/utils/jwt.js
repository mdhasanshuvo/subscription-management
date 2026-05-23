const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId, expiresIn = process.env.JWT_EXPIRE || '7d') => {
  const payload = {
    userId,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn,
  });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Decode JWT token without verification
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
};
