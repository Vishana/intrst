const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/users/onboarding
// @desc    Complete user onboarding
// @access  Private
router.post('/onboarding', auth, async (req, res) => {
  try {
    const {
      lifeStage,
      income,
      primaryGoals,
      riskTolerance,
      customGoals,
      currentSavings,
      monthlyIncome,
      monthlyExpenses,
      debt,
      creditScore
    } = req.body;
    
    const user = await User.findById(req.user._id);
    
    // Update onboarding information
    user.onboarding = {
      isComplete: true,
      lifeStage,
      income,
      primaryGoals,
      riskTolerance,
      customGoals: customGoals || []
    };
    
    // Update financial profile
    user.financialProfile = {
      currentSavings: currentSavings || 0,
      monthlyIncome: monthlyIncome || income || 0,
      monthlyExpenses: monthlyExpenses || 0,
      debt: debt || 0,
      creditScore: creditScore || null
    };
    
    // Award onboarding points
    user.gamification.points += 100;
    user.gamification.achievements.push({
      name: 'Getting Started',
      description: 'Completed onboarding process',
      earnedAt: new Date(),
      icon: '🚀'
    });
    
    await user.save();
    
    res.json({
      message: 'Onboarding completed successfully',
      user: {
        id: user._id,
        onboarding: user.onboarding,
        financialProfile: user.financialProfile,
        points: user.gamification.points
      }
    });
    
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({
      message: 'Server error during onboarding'
    });
  }
});

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.json({
      profile: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.getDisplayName(),
        onboarding: user.onboarding,
        financialProfile: user.financialProfile,
        preferences: user.preferences,
        gamification: user.gamification,
        netWorth: user.calculateNetWorth(),
        memberSince: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
    
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      financialProfile,
      preferences,
      onboarding // 👈 catch onboarding updates from frontend
    } = req.body;

    const user = await User.findById(req.user._id);

    // Update basic info
    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();

    // Update financial profile
    if (financialProfile) {
      user.financialProfile = {
        ...user.financialProfile,
        ...financialProfile
      };
    }

    // Update preferences
    if (preferences) {
      user.preferences = {
        ...user.preferences,
        ...preferences
      };
    }

    if (onboarding) {
      user.onboarding = {
        ...user.onboarding,
        ...onboarding
      };
    }

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.getDisplayName(),
        onboarding: user.onboarding,
        financialProfile: user.financialProfile,
        preferences: user.preferences,
        gamification: user.gamification,
        netWorth: user.calculateNetWorth(),
        memberSince: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics and achievements
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Calculate additional stats
    const daysSinceJoin = Math.floor((new Date() - user.createdAt) / (1000 * 60 * 60 * 24));
    const netWorth = user.calculateNetWorth();
    const savingsRate = user.financialProfile.monthlyIncome > 0 
      ? ((user.financialProfile.monthlyIncome - user.financialProfile.monthlyExpenses) / user.financialProfile.monthlyIncome * 100)
      : 0;
    
    res.json({
      stats: {
        gamification: user.gamification,
        financialHealth: {
          netWorth,
          savingsRate: Math.round(savingsRate * 100) / 100,
          debtToIncomeRatio: user.financialProfile.monthlyIncome > 0 
            ? Math.round((user.financialProfile.debt / (user.financialProfile.monthlyIncome * 12)) * 100)
            : 0
        },
        activity: {
          membershipDays: daysSinceJoin,
          lastLogin: user.lastLogin,
          currentStreak: user.gamification.streak.current,
          bestStreak: user.gamification.streak.best
        },
        achievements: user.gamification.achievements
      }
    });
    
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// @route   POST /api/users/activity
// @desc    Record user activity (for streak tracking)
// @access  Private
router.post('/activity', auth, async (req, res) => {
  try {
    const { activityType, points = 10 } = req.body;
    
    const user = await User.findById(req.user._id);
    
    // Update streak
    user.updateStreak();
    
    // Award points
    user.gamification.points += points;
    
    // Check for achievements
    const achievements = [];
    
    // Streak achievements
    if (user.gamification.streak.current === 7 && !user.gamification.achievements.some(a => a.name === '7-Day Streak')) {
      achievements.push({
        name: '7-Day Streak',
        description: 'Logged in for 7 consecutive days',
        earnedAt: new Date(),
        icon: '🔥'
      });
    }
    
    if (user.gamification.streak.current === 30 && !user.gamification.achievements.some(a => a.name === '30-Day Streak')) {
      achievements.push({
        name: '30-Day Streak',
        description: 'Logged in for 30 consecutive days',
        earnedAt: new Date(),
        icon: '💪'
      });
    }
    
    // Points achievements
    if (user.gamification.points >= 1000 && !user.gamification.achievements.some(a => a.name === 'Point Collector')) {
      achievements.push({
        name: 'Point Collector',
        description: 'Earned 1,000 points',
        earnedAt: new Date(),
        icon: '💰'
      });
    }
    
    // Add new achievements
    user.gamification.achievements.push(...achievements);
    
    await user.save();
    
    res.json({
      message: 'Activity recorded',
      streak: user.gamification.streak.current,
      points: user.gamification.points,
      newAchievements: achievements
    });
    
  } catch (error) {
    console.error('Activity recording error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', auth, async (req, res) => {
  try {
    const { confirmPassword } = req.body;
    
    if (!confirmPassword) {
      return res.status(400).json({
        message: 'Password confirmation required'
      });
    }
    
    const user = await User.findById(req.user._id);
    
    // Verify password
    const isMatch = await user.matchPassword(confirmPassword);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Password is incorrect'
      });
    }
    
    // In a real app, you would also delete related data (goals, bets, transactions, etc.)
    // For now, just delete the user
    await User.findByIdAndDelete(req.user._id);
    
    res.json({
      message: 'Account deleted successfully'
    });
    
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

module.exports = router;
