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
        onboardingComplete: user.onboarding.isComplete,
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
      primaryGoals, // Support both formats
      riskTolerance,
      monthlyIncome, 
      monthlyExpenses, 
      currentSavings, 
      debt,
      investmentExperience,
      investmentTimeline,
      timeHorizon,
      notifications,
      communicationMethod
    } = req.body;
    
    // Handle both primaryGoal (single) and primaryGoals (array)
    const finalPrimaryGoals = primaryGoals || (primaryGoal ? [primaryGoal] : []);
    
    // Validation - check for essential fields
    if (!age || !lifeStage || !riskTolerance || finalPrimaryGoals.length === 0) {
      return res.status(400).json({
        message: 'Age, life stage, primary goals, and risk tolerance are required'
      });
    }
    
    // Validate numeric fields
    if (monthlyIncome !== undefined && monthlyIncome < 0) {
      return res.status(400).json({
        message: 'Monthly income must be a positive number'
      });
    }
    
    if (monthlyExpenses !== undefined && monthlyExpenses < 0) {
      return res.status(400).json({
        message: 'Monthly expenses must be a positive number'
      });
    }
    
    if (currentSavings !== undefined && currentSavings < 0) {
      return res.status(400).json({
        message: 'Current savings must be a positive number'
      });
    }
    
    if (debt !== undefined && debt < 0) {
      return res.status(400).json({
        message: 'Debt must be a positive number'
      });
    }
    
    // Update user with onboarding data
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }
    
    // Update onboarding information
    user.onboarding.lifeStage = lifeStage;
    user.onboarding.primaryGoals = finalPrimaryGoals;
    user.onboarding.riskTolerance = riskTolerance;
    user.onboarding.age = age;
    user.onboarding.isComplete = true;
    user.onboarding.completedAt = new Date();
    
    // Update investment preferences if provided
    if (investmentExperience) {
      user.onboarding.investmentExperience = investmentExperience;
    }
    if (investmentTimeline) {
      user.onboarding.investmentTimeline = investmentTimeline;
    }
    if (timeHorizon) {
      user.onboarding.timeHorizon = timeHorizon;
    }
    if (communicationMethod) {
      user.onboarding.communicationMethod = communicationMethod;
    }
    
    // Update financial profile (only if provided)
    if (monthlyIncome !== undefined) {
      user.financialProfile.monthlyIncome = Number(monthlyIncome);
    }
    if (monthlyExpenses !== undefined) {
      user.financialProfile.monthlyExpenses = Number(monthlyExpenses);
    }
    if (currentSavings !== undefined) {
      user.financialProfile.currentSavings = Number(currentSavings);
    }
    if (debt !== undefined) {
      user.financialProfile.debt = Number(debt);
    }
    
    // Update preferences if provided
    if (notifications) {
      if (notifications.goalReminders !== undefined) {
        user.preferences.notifications.goals = notifications.goalReminders;
      }
      if (notifications.budgetAlerts !== undefined) {
        user.preferences.notifications.email = notifications.budgetAlerts;
      }
      if (notifications.savingsTips !== undefined) {
        user.preferences.notifications.advisor = notifications.savingsTips;
      }
      if (notifications.bettingUpdates !== undefined) {
        user.preferences.notifications.bets = notifications.bettingUpdates;
      }
    }
    
    // Award onboarding completion points
    user.gamification.points += 100;
    user.gamification.achievements.push({
      name: 'Getting Started',
      description: 'Completed your financial profile setup',
      earnedAt: new Date(),
      icon: '🎯'
    });
    
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
        gamification: user.gamification,
        preferences: user.preferences
      }
    });
    
  } catch (error) {
    console.error('Onboarding error:', error);
    
    // More detailed error logging
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid data format provided'
      });
    }
    
    res.status(500).json({
      message: 'Server error during onboarding',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
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
