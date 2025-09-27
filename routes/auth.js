const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        message: 'All fields are required'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters'
      });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists with this email'
      });
    }
    
    // Create user
    const user = new User({
      email: email.toLowerCase(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim()
    });
    
    await user.save();
    
    // Generate token
    const token = generateToken(user._id);
    
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        onboardingComplete: user.onboarding.isComplete
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }
    
    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }
    
    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }
    
    // Update last login and streak
    user.updateStreak();
    user.lastLogin = new Date();
    await user.save();
    
    // Generate token
    const token = generateToken(user._id);
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        onboardingComplete: user.onboarding.isComplete,
        streak: user.gamification.streak.current,
        points: user.gamification.points
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Server error during login'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user info
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        onboarding: user.onboarding,
        financialProfile: user.financialProfile,
        preferences: user.preferences,
        gamification: user.gamification,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
    
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Current password and new password are required'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'New password must be at least 6 characters'
      });
    }
    
    // Get user with password
    const user = await User.findById(req.user._id);
    
    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({
      message: 'Password updated successfully'
    });
    
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/onboarding
// @desc    Complete user onboarding
// @access  Private
router.post('/onboarding', auth, async (req, res) => {
  try {
    console.log('Onboarding data received:', req.body);
    
    const { 
      age, 
      lifeStage, 
      primaryGoal,
      riskTolerance,
      monthlyIncome, 
      monthlyExpenses, 
      currentSavings, 
      debt,
      investmentExperience,
      investmentTimeline
    } = req.body;
    
    // Validation - only check for essential fields
    if (!age || !lifeStage || !primaryGoal || !riskTolerance || 
        monthlyIncome === undefined || monthlyExpenses === undefined || 
        currentSavings === undefined) {
      return res.status(400).json({
        message: 'All onboarding fields are required'
      });
    }
    
    // Update user with onboarding data
    const user = await User.findById(req.user._id);
    
    // Update onboarding information
    user.onboarding.lifeStage = lifeStage;
    user.onboarding.primaryGoals = [primaryGoal]; // Convert single goal to array
    user.onboarding.riskTolerance = riskTolerance;
    user.onboarding.isComplete = true;
    
    // Update financial profile
    user.financialProfile.monthlyIncome = monthlyIncome;
    user.financialProfile.monthlyExpenses = monthlyExpenses;
    user.financialProfile.currentSavings = currentSavings;
    user.financialProfile.debt = debt || 0; // Default to 0 if not provided
    
    await user.save();
    
    res.json({
      message: 'Onboarding completed successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        onboardingComplete: user.onboarding.isComplete,
        financialProfile: user.financialProfile,
        onboarding: user.onboarding,
        gamification: user.gamification
      }
    });
    
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({
      message: 'Server error during onboarding'
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset (placeholder)
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // In a real app, you would:
    // 1. Generate a reset token
    // 2. Save it to the user's record
    // 3. Send an email with the reset link
    
    // For now, just return a success message
    res.json({
      message: 'If an account with that email exists, a password reset link has been sent'
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    // In a real app, you might want to blacklist the token
    // For now, just send a success response
    res.json({
      message: 'Logged out successfully'
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

module.exports = router;
