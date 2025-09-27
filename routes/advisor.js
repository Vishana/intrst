const express = require('express');
const { auth, requireOnboarding, rateLimitRequests } = require('../middleware/auth');
const aiAdvisor = require('../services/aiAdvisor');
const Transaction = require('../models/Transaction');
const Goal = require('../models/Goal');

const router = express.Router();

// @route   POST /api/advisor/chat
// @desc    Chat with AI financial advisor
// @access  Private
router.post('/chat', auth, requireOnboarding, rateLimitRequests(20, 15 * 60 * 1000), async (req, res) => {
  try {
    const { message, context = {} } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ 
        message: 'Message is required' 
      });
    }
    
    console.log(`💬 AI Advisor request from ${req.user.firstName}: "${message}"`);
    
    // Get additional context if needed
    let financialData = context;
    
    // If context is minimal, get user's recent transactions and goals
    if (Object.keys(context).length === 0) {
      try {
        const recentTransactions = await Transaction.find({ userId: req.user._id })
          .sort({ date: -1 })
          .limit(20)
          .select('amount category description date type');
          
        const userGoals = await Goal.find({ userId: req.user._id })
          .select('title targetAmount currentAmount targetDate priority status');
          
        financialData = {
          recentTransactions,
          currentGoals: userGoals
        };
      } catch (dbError) {
        console.warn('Could not fetch additional context:', dbError.message);
      }
    }
    
    // Generate AI response
    const aiResponse = await aiAdvisor.generateFinancialAdvice(
      message, 
      req.user, 
      financialData
    );
    
    console.log(`✅ AI response generated using ${aiResponse.provider}`);
    
    res.json({
      ...aiResponse,
      userId: req.user._id,
      query: message
    });
    
  } catch (error) {
    console.error('Advisor chat error:', error);
    
    // Provide fallback response if AI fails
    const fallbackResponse = generateFallbackResponse(req.body.message, req.user);
    
    res.json({
      ...fallbackResponse,
      fallback: true,
      error: 'AI advisor temporarily unavailable'
    });
  }
});

// @route   POST /api/advisor/analyze-spending
// @desc    Analyze spending patterns with AI
// @access  Private
router.post('/analyze-spending', auth, requireOnboarding, async (req, res) => {
  try {
    const { timeRange = '30d', category } = req.body;
    
    console.log(`📊 Spending analysis request for ${timeRange}`);
    
    // Get transactions from the specified time range
    const daysBack = timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    
    const transactions = await Transaction.find({
      userId: req.user._id,
      date: { $gte: startDate },
      ...(category && { category })
    }).sort({ date: -1 });
    
    if (transactions.length === 0) {
      return res.json({
        summary: "Not enough transaction data for analysis",
        insights: ["Add some transactions to get personalized spending insights"],
        recommendations: [],
        visualization: null
      });
    }
    
    // Use AI to analyze spending
    const analysis = await aiAdvisor.analyzeSpendingPattern(
      transactions, 
      req.user, 
      timeRange
    );
    
    // Add visualization data
    analysis.visualization = generateSpendingVisualization(transactions);
    
    console.log(`✅ Spending analysis completed`);
    res.json(analysis);
    
  } catch (error) {
    console.error('Spending analysis error:', error);
    
    // Fallback analysis
    res.json({
      summary: "Unable to generate detailed analysis at this time",
      insights: [
        "Track your expenses regularly for better insights",
        "Set up spending categories to monitor your habits",
        "Review your monthly spending against your budget"
      ],
      recommendations: [],
      fallback: true
    });
  }
});

// @route   POST /api/advisor/optimize-goals
// @desc    Get AI advice on goal optimization
// @access  Private
router.post('/optimize-goals', auth, requireOnboarding, async (req, res) => {
  try {
    console.log(`🎯 Goal optimization request from ${req.user.firstName}`);
    
    // Get user's goals and progress
    const goals = await Goal.find({ userId: req.user._id });
    
    if (goals.length === 0) {
      return res.json({
        message: "You haven't set any goals yet. Let's create some financial goals first!",
        recommendations: [
          "Set up an emergency fund goal",
          "Create a retirement savings goal",
          "Define a major purchase goal"
        ]
      });
    }
    
    // Calculate progress for each goal
    const goalsWithProgress = goals.map(goal => ({
      ...goal.toObject(),
      progress: (goal.currentAmount / goal.targetAmount) * 100,
      monthsRemaining: Math.ceil(
        (new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24 * 30)
      )
    }));
    
    // Use AI to optimize goals
    const optimization = await aiAdvisor.optimizeGoals(
      goalsWithProgress, 
      req.user, 
      goalsWithProgress
    );
    
    console.log(`✅ Goal optimization completed`);
    res.json(optimization);
    
  } catch (error) {
    console.error('Goal optimization error:', error);
    
    res.json({
      message: "Unable to generate goal optimization at this time",
      recommendations: [
        "Review your goal timelines regularly",
        "Adjust contributions based on priority",
        "Celebrate small wins along the way"
      ],
      fallback: true
    });
  }
});

// @route   POST /api/advisor/budget-plan
// @desc    Generate personalized budget plan
// @access  Private
router.post('/budget-plan', auth, requireOnboarding, async (req, res) => {
  try {
    const { preferences = {} } = req.body;
    
    console.log(`💰 Budget planning request from ${req.user.firstName}`);
    
    // Generate AI-powered budget plan
    const budgetPlan = await aiAdvisor.generateBudgetPlan(req.user, preferences);
    
    console.log(`✅ Budget plan generated`);
    res.json(budgetPlan);
    
  } catch (error) {
    console.error('Budget planning error:', error);
    
    // Fallback budget using 50/30/20 rule
    const income = req.user.financialProfile?.monthlyIncome || 0;
    const fallbackBudget = {
      budget_method: "50/30/20 Rule (Fallback)",
      categories: {
        needs: { amount: Math.round(income * 0.5), percentage: 50, items: ["Housing", "Food", "Transportation", "Utilities"] },
        wants: { amount: Math.round(income * 0.3), percentage: 30, items: ["Entertainment", "Dining out", "Shopping"] },
        savings: { amount: Math.round(income * 0.2), percentage: 20, items: ["Emergency fund", "Retirement", "Goals"] }
      },
      recommendations: [
        "Track your actual spending to compare with this budget",
        "Adjust percentages based on your specific situation",
        "Review and update monthly"
      ],
      fallback: true
    };
    
    res.json(fallbackBudget);
  }
});

// @route   GET /api/advisor/insights
// @desc    Get personalized financial insights
// @access  Private
router.get('/insights', auth, requireOnboarding, async (req, res) => {
  try {
    console.log(`🔍 Financial insights request from ${req.user.firstName}`);
    
    // Get recent financial activity
    const [recentTransactions, goals, monthlySpending] = await Promise.all([
      Transaction.find({ userId: req.user._id })
        .sort({ date: -1 })
        .limit(10),
      Goal.find({ userId: req.user._id }),
      Transaction.aggregate([
        {
          $match: {
            userId: req.user._id,
            date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ])
    ]);
    
    // Generate insights based on user data
    const insights = {
      spending_insights: monthlySpending.map(cat => ({
        category: cat._id,
        amount: cat.total,
        transactions: cat.count
      })),
      goal_progress: goals.map(goal => ({
        title: goal.title,
        progress: Math.round((goal.currentAmount / goal.targetAmount) * 100),
        remaining: goal.targetAmount - goal.currentAmount
      })),
      recommendations: [
        "Review your monthly spending patterns",
        "Set up automatic savings transfers",
        "Check your progress on financial goals"
      ],
      next_actions: [
        "Log today's expenses",
        "Review your budget categories",
        "Update goal contributions"
      ]
    };
    
    res.json(insights);
    
  } catch (error) {
    console.error('Insights generation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper functions
function generateFallbackResponse(message, user) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('save') || lowerMessage.includes('saving')) {
    return {
      response: `Great question about saving! Based on your financial profile, I recommend following the 50/30/20 rule. With your current income of $${user.financialProfile?.monthlyIncome || 0}, you should aim to save $${Math.round((user.financialProfile?.monthlyIncome || 0) * 0.2)} monthly.`,
      insights: [
        "Automatic transfers help build consistent saving habits",
        "High-yield savings accounts can boost your returns",
        "Start with small amounts if you're new to saving"
      ],
      suggestions: [
        "Set up automatic savings transfers",
        "Schedule weekly transfers to your savings account",
        "Consider a high-yield savings account"
      ]
    };
  }
  
  return {
    response: `I understand you're asking about "${message}". While I'm temporarily unable to provide AI-powered insights, I can offer some general financial guidance based on your profile.`,
    insights: [
      "Regular financial check-ins help maintain good habits",
      "Setting clear goals improves success rates",
      "Tracking expenses increases awareness"
    ],
    suggestions: [
      "Track your expenses daily",
      "Review your budget regularly",
      "Set up specific financial goals"
    ]
  };
}

function generateSpendingVisualization(transactions) {
  // Group transactions by category
  const categoryTotals = transactions.reduce((acc, transaction) => {
    const category = transaction.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + transaction.amount;
    return acc;
  }, {});
  
  return {
    type: 'spending-breakdown',
    title: 'Spending by Category',
    data: {
      labels: Object.keys(categoryTotals),
      datasets: [{
        label: 'Amount Spent',
        data: Object.values(categoryTotals),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
        ]
      }]
    }
  };
}

module.exports = router;
