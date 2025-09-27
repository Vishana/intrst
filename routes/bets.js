const express = require('express');
const { auth, requireOnboarding } = require('../middleware/auth');
const Bet = require('../models/Bet');
const Transaction = require('../models/Transaction');
const aiAdvisor = require('../services/aiAdvisor');

const router = express.Router();

// @route   GET /api/bets
// @desc    Get all bets for authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, category } = req.query;
    
    const filter = { userId: req.user._id };
    if (status) filter.status = status;
    if (category) filter.category = category;
    
    const bets = await Bet.find(filter)
      .sort({ createdAt: -1 });
    
    // Calculate additional metrics for each bet
    const betsWithMetrics = bets.map(bet => {
      const betObj = bet.toObject();
      return {
        ...betObj,
        progressPercentage: bet.progressPercentage,
        daysRemaining: bet.daysRemaining,
        daysElapsed: bet.daysElapsed,
        requiredDailyProgress: bet.getRequiredDailyProgress(),
        onTrack: bet.isOnTrack(),
        autoFailCheck: bet.checkAutoFail()
      };
    });
    
    res.json(betsWithMetrics);
    
  } catch (error) {
    console.error('Get bets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/bets/:id
// @desc    Get specific bet with detailed analytics
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const bet = await Bet.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!bet) {
      return res.status(404).json({ message: 'Bet not found' });
    }
    
    // Get related transactions if any
    const relatedTransactions = await Transaction.find({
      linkedBet: bet._id,
      userId: req.user._id
    }).sort({ date: -1 });
    
    // Calculate detailed analytics
    const analytics = {
      totalProgressUpdates: bet.progressUpdates.length,
      averageProgressPerUpdate: bet.progressUpdates.length > 0 
        ? bet.progressUpdates.reduce((sum, update) => sum + update.value, 0) / bet.progressUpdates.length 
        : 0,
      progressVelocity: 0, // Progress per day
      riskLevel: bet.isOnTrack() ? 'low' : bet.daysRemaining < 7 ? 'high' : 'medium',
      estimatedOutcome: bet.isOnTrack() ? 'success' : 'at-risk'
    };
    
    // Calculate progress velocity
    if (bet.daysElapsed > 0) {
      analytics.progressVelocity = bet.currentValue / bet.daysElapsed;
    }
    
    const betWithDetails = {
      ...bet.toObject(),
      progressPercentage: bet.progressPercentage,
      daysRemaining: bet.daysRemaining,
      daysElapsed: bet.daysElapsed,
      requiredDailyProgress: bet.getRequiredDailyProgress(),
      onTrack: bet.isOnTrack(),
      analytics,
      relatedTransactions
    };
    
    res.json(betWithDetails);
    
  } catch (error) {
    console.error('Get bet details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/bets
// @desc    Create new financial bet
// @access  Private
router.post('/', auth, requireOnboarding, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      stakeAmount,
      targetMetric,
      targetValue,
      startDate,
      endDate,
      selectedCharity,
      visibility
    } = req.body;
    
    // Validation
    if (!title || !description || !category || !stakeAmount || !targetMetric || !targetValue || !endDate) {
      return res.status(400).json({
        message: 'All bet details are required'
      });
    }
    
    if (stakeAmount <= 0 || targetValue <= 0) {
      return res.status(400).json({
        message: 'Stake amount and target value must be positive'
      });
    }
    
    const parsedStartDate = startDate ? new Date(startDate) : new Date();
    const parsedEndDate = new Date(endDate);
    
    if (parsedEndDate <= parsedStartDate) {
      return res.status(400).json({
        message: 'End date must be after start date'
      });
    }
    
    if (parsedEndDate <= new Date()) {
      return res.status(400).json({
        message: 'End date must be in the future'
      });
    }
    
    const newBet = new Bet({
      userId: req.user._id,
      title,
      description,
      category,
      stakeAmount,
      targetMetric,
      targetValue,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      selectedCharity: selectedCharity || {},
      visibility: visibility || 'private',
      status: 'pending' // Will become 'active' after payment
    });
    
    await newBet.save();
    
    // Award points for creating a bet
    req.user.gamification.points += 50;
    req.user.gamification.achievements.push({
      name: 'Risk Taker',
      description: 'Created your first financial bet',
      earnedAt: new Date(),
      icon: '🎲'
    });
    await req.user.save();
    
    console.log(`🎲 New bet created: "${title}" by ${req.user.firstName}`);
    
    res.status(201).json({
      message: 'Bet created successfully',
      bet: {
        ...newBet.toObject(),
        progressPercentage: newBet.progressPercentage,
        daysRemaining: newBet.daysRemaining
      },
      nextStep: 'payment_required'
    });
    
  } catch (error) {
    console.error('Create bet error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/bets/:id
// @desc    Update bet details (only if not active)
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const bet = await Bet.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!bet) {
      return res.status(404).json({ message: 'Bet not found' });
    }
    
    if (bet.status === 'active') {
      return res.status(400).json({ message: 'Cannot modify active bets' });
    }
    
    const allowedUpdates = [
      'title', 'description', 'targetMetric', 'targetValue', 
      'endDate', 'selectedCharity', 'visibility'
    ];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'endDate') {
          bet[field] = new Date(req.body[field]);
        } else {
          bet[field] = req.body[field];
        }
      }
    });
    
    await bet.save();
    
    console.log(`📝 Bet updated: "${bet.title}" by ${req.user.firstName}`);
    
    res.json({
      message: 'Bet updated successfully',
      bet: {
        ...bet.toObject(),
        progressPercentage: bet.progressPercentage,
        daysRemaining: bet.daysRemaining
      }
    });
    
  } catch (error) {
    console.error('Update bet error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/bets/:id/update-progress
// @desc    Update bet progress
// @access  Private
router.post('/:id/update-progress', auth, async (req, res) => {
  try {
    const { value, note, evidence } = req.body;
    
    if (value === undefined || value < 0) {
      return res.status(400).json({ message: 'Valid progress value is required' });
    }
    
    const bet = await Bet.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!bet) {
      return res.status(404).json({ message: 'Bet not found' });
    }
    
    if (bet.status !== 'active') {
      return res.status(400).json({ message: 'Can only update progress for active bets' });
    }
    
    // Add evidence if provided
    if (evidence && evidence.length > 0) {
      evidence.forEach(item => {
        bet.evidence.push({
          type: item.type,
          url: item.url,
          description: item.description
        });
      });
    }
    
    // Update progress using the model method
    bet.updateProgress(value, note || '', 'manual');
    await bet.save();
    
    // Award points for progress updates
    req.user.gamification.points += 5;
    await req.user.save();
    
    console.log(`📈 Bet progress updated: "${bet.title}" to ${value} by ${req.user.firstName}`);
    
    const response = {
      message: 'Progress updated successfully',
      bet: {
        ...bet.toObject(),
        progressPercentage: bet.progressPercentage,
        daysRemaining: bet.daysRemaining,
        onTrack: bet.isOnTrack()
      }
    };
    
    // Check if bet was completed
    if (bet.status === 'completed') {
      response.message = 'Congratulations! Bet completed successfully!';
      response.outcome = bet.completionDetails.outcome;
    }
    
    res.json(response);
    
  } catch (error) {
    console.error('Update bet progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/bets/:id/activate
// @desc    Activate bet after payment confirmation
// @access  Private
router.post('/:id/activate', auth, async (req, res) => {
  try {
    const { paymentIntentId, amountPaid } = req.body;
    
    const bet = await Bet.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!bet) {
      return res.status(404).json({ message: 'Bet not found' });
    }
    
    if (bet.status !== 'pending') {
      return res.status(400).json({ message: 'Bet is not in pending status' });
    }
    
    // In a real implementation, verify payment with Stripe here
    // For now, we'll simulate payment confirmation
    
    bet.status = 'active';
    bet.payment.stripePaymentIntentId = paymentIntentId;
    bet.payment.amountPaid = amountPaid || bet.stakeAmount;
    bet.payment.paymentDate = new Date();
    
    await bet.save();
    
    console.log(`✅ Bet activated: "${bet.title}" by ${req.user.firstName}`);
    
    res.json({
      message: 'Bet activated successfully! Good luck!',
      bet: {
        ...bet.toObject(),
        progressPercentage: bet.progressPercentage,
        daysRemaining: bet.daysRemaining
      }
    });
    
  } catch (error) {
    console.error('Activate bet error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/bets/:id/cancel
// @desc    Cancel bet (only if not active)
// @access  Private
router.post('/:id/cancel', auth, async (req, res) => {
  try {
    const bet = await Bet.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!bet) {
      return res.status(404).json({ message: 'Bet not found' });
    }
    
    if (bet.status === 'active') {
      return res.status(400).json({ message: 'Cannot cancel active bets' });
    }
    
    bet.status = 'cancelled';
    await bet.save();
    
    console.log(`❌ Bet cancelled: "${bet.title}" by ${req.user.firstName}`);
    
    res.json({ message: 'Bet cancelled successfully' });
    
  } catch (error) {
    console.error('Cancel bet error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/bets/analytics/overview
// @desc    Get betting analytics overview
// @access  Private
router.get('/analytics/overview', auth, async (req, res) => {
  try {
    const bets = await Bet.find({ userId: req.user._id });
    
    const analytics = {
      total: bets.length,
      active: bets.filter(b => b.status === 'active').length,
      completed: bets.filter(b => b.status === 'completed').length,
      won: bets.filter(b => b.completionDetails.outcome === 'success').length,
      lost: bets.filter(b => b.completionDetails.outcome === 'failure').length,
      totalStaked: bets.reduce((sum, b) => sum + b.stakeAmount, 0),
      totalWon: bets.filter(b => b.completionDetails.outcome === 'success').length * 0, // Will calculate from refunds
      winRate: 0,
      averageStake: bets.length > 0 ? bets.reduce((sum, b) => sum + b.stakeAmount, 0) / bets.length : 0,
      categoryBreakdown: {},
      onTrackCount: bets.filter(b => b.status === 'active' && b.isOnTrack()).length,
      atRiskCount: bets.filter(b => b.status === 'active' && !b.isOnTrack()).length
    };
    
    // Calculate win rate
    const completedBets = bets.filter(b => b.status === 'completed');
    if (completedBets.length > 0) {
      analytics.winRate = (analytics.won / completedBets.length) * 100;
    }
    
    // Category breakdown
    bets.forEach(bet => {
      if (!analytics.categoryBreakdown[bet.category]) {
        analytics.categoryBreakdown[bet.category] = {
          count: 0,
          totalStaked: 0,
          won: 0,
          lost: 0
        };
      }
      analytics.categoryBreakdown[bet.category].count++;
      analytics.categoryBreakdown[bet.category].totalStaked += bet.stakeAmount;
      if (bet.completionDetails.outcome === 'success') {
        analytics.categoryBreakdown[bet.category].won++;
      } else if (bet.completionDetails.outcome === 'failure') {
        analytics.categoryBreakdown[bet.category].lost++;
      }
    });
    
    res.json(analytics);
    
  } catch (error) {
    console.error('Betting analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/bets/suggestions
// @desc    Get AI-powered bet suggestions
// @access  Private
router.post('/suggestions', auth, async (req, res) => {
  try {
    const { preferences = {} } = req.body;
    
    try {
      // Get AI suggestions for financial bets
      const suggestions = await aiAdvisor.generateFinancialAdvice(
        "What financial challenges or bets would be good for me to try based on my financial situation?",
        req.user,
        { preferences, requestType: 'bet_suggestions' }
      );
      
      // Format suggestions for betting
      const betSuggestions = {
        recommended_bets: [
          {
            title: "30-Day No Dining Out Challenge",
            description: "Avoid restaurant meals for 30 days",
            category: "spending_limit",
            suggestedStake: Math.min(100, req.user.financialProfile?.monthlyIncome * 0.02 || 50),
            difficulty: "medium",
            estimatedSavings: 300
          },
          {
            title: "Emergency Fund Booster",
            description: "Add $500 to emergency fund this month",
            category: "savings",
            suggestedStake: 75,
            difficulty: "medium",
            estimatedSavings: 500
          },
          {
            title: "Side Hustle Income Goal",
            description: "Earn $200 extra income this month",
            category: "income_goal",
            suggestedStake: 50,
            difficulty: "hard",
            estimatedSavings: 200
          }
        ],
        ai_advice: suggestions.response || "Consider starting with smaller challenges to build confidence.",
        insights: suggestions.insights || []
      };
      
      res.json(betSuggestions);
      
    } catch (aiError) {
      // Fallback suggestions
      const fallbackSuggestions = {
        recommended_bets: [
          {
            title: "Weekly Budget Tracker",
            description: "Track every expense for one week",
            category: "habit_change",
            suggestedStake: 25,
            difficulty: "easy",
            estimatedSavings: 0
          }
        ],
        ai_advice: "Start with simple tracking challenges to build good financial habits.",
        insights: ["Small consistent actions lead to big results"],
        fallback: true
      };
      
      res.json(fallbackSuggestions);
    }
    
  } catch (error) {
    console.error('Bet suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cron job endpoint to check for expired bets (would normally be a separate service)
// @route   POST /api/bets/check-expired
// @desc    Check and update expired bets
// @access  Private (admin only in production)
router.post('/check-expired', auth, async (req, res) => {
  try {
    const expiredBets = await Bet.find({
      status: 'active',
      endDate: { $lt: new Date() }
    });
    
    let updatedCount = 0;
    
    for (let bet of expiredBets) {
      bet.checkAutoFail();
      await bet.save();
      updatedCount++;
      
      console.log(`⏰ Auto-failed expired bet: "${bet.title}"`);
    }
    
    res.json({
      message: `Processed ${updatedCount} expired bets`,
      updatedCount
    });
    
  } catch (error) {
    console.error('Check expired bets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
