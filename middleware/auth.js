const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        message: 'No token provided, access denied' 
      });
    }
    
    // Check for JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({
        message: 'Server configuration error'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded.userId) {
      return res.status(401).json({ 
        message: 'Invalid token structure' 
      });
    }
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        message: 'User not found, token is invalid' 
      });
    }
    
    // Add user to request object
    req.user = user;
    
    // Update last login (but don't wait for it to complete)
    User.findByIdAndUpdate(user._id, { lastLogin: new Date() }).catch(err => {
      console.error('Failed to update last login:', err);
    });
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token has expired, please log in again' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token format' 
      });
    }
    
    if (error.name === 'NotBeforeError') {
      return res.status(401).json({ 
        message: 'Token not active yet' 
      });
    }
    
    // Database connection errors
    if (error.name === 'MongoNetworkError' || error.name === 'MongooseError') {
      return res.status(503).json({ 
        message: 'Database connection error, please try again later' 
      });
    }
    
    res.status(401).json({ 
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Middleware to check if onboarding is complete
const requireOnboarding = async (req, res, next) => {
  try {
    if (!req.user.onboarding.isComplete) {
      return res.status(403).json({
        message: 'Onboarding must be completed to access this resource',
        redirectTo: '/onboarding'
      });
    }
    next();
  } catch (error) {
    console.error('Onboarding check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Middleware to check if user owns a resource
const checkResourceOwnership = (Model) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      const userId = req.user._id;
      
      const resource = await Model.findOne({
        _id: resourceId,
        userId: userId
      });
      
      if (!resource) {
        return res.status(404).json({
          message: 'Resource not found or access denied'
        });
      }
      
      req.resource = resource;
      next();
    } catch (error) {
      console.error('Resource ownership check error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
};

// Middleware for admin-only routes (future use)
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Admin access required'
    });
  }
  next();
};

// Rate limiting middleware (basic implementation)
const rateLimitRequests = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const userId = req.user?._id?.toString();
    const key = userId || req.ip;
    const now = Date.now();
    
    if (!requests.has(key)) {
      requests.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const userRequests = requests.get(key);
    
    if (now > userRequests.resetTime) {
      userRequests.count = 1;
      userRequests.resetTime = now + windowMs;
      return next();
    }
    
    if (userRequests.count >= maxRequests) {
      return res.status(429).json({
        message: 'Too many requests, please try again later',
        resetTime: new Date(userRequests.resetTime).toISOString()
      });
    }
    
    userRequests.count++;
    next();
  };
};

module.exports = {
  auth,
  requireOnboarding,
  checkResourceOwnership,
  adminOnly,
  rateLimitRequests
};
