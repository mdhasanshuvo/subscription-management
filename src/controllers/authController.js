const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { formatSuccessResponse, formatErrorResponse } = require('../utils/responseFormatter');

/**
 * Register a new user
 * POST /api/auth/register
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, passwordConfirm } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json(
        formatErrorResponse('Name, email, and password are required', 400)
      );
    }

    if (password !== passwordConfirm) {
      return res.status(400).json(
        formatErrorResponse('Passwords do not match', 400)
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json(
        formatErrorResponse('Email already registered', 400)
      );
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Return response (don't leak password)
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.status(201).json(
      formatSuccessResponse('User registered successfully', {
        user: userResponse,
        token,
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json(
        formatErrorResponse('Email and password are required', 400)
      );
    }

    // Find user and include password field (normally hidden)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json(
        formatErrorResponse('Invalid email or password', 401)
      );
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json(
        formatErrorResponse('Invalid email or password', 401)
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json(
        formatErrorResponse('User account is inactive', 403)
      );
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Return response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.status(200).json(
      formatSuccessResponse('User logged in successfully', {
        user: userResponse,
        token,
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
const getCurrentUser = async (req, res, next) => {
  try {
    const user = req.user;

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    };

    res.status(200).json(
      formatSuccessResponse('User profile retrieved successfully', userResponse)
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
};
