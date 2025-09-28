const express = require('express');
const { auth, requireOnboarding, rateLimitRequests } = require('../middleware/auth');
const aiAdvisor = require('../services/aiAdvisor');
const Transaction = require('../models/Transaction');
const Goal = require('../models/Goal');
const User = require('../models/User');

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
        // Get full user data with integrations
        const fullUser = await User.findById(req.user._id);
        
        const recentTransactions = await Transaction.find({ userId: req.user._id })
          .sort({ date: -1 })
          .limit(20)
          .select('amount category description date type');
          
        const userGoals = await Goal.find({ userId: req.user._id })
          .select('title targetAmount currentAmount targetDate priority status');
          
        // Include integration data and insights
        financialData = {
          recentTransactions,
          currentGoals: userGoals,
          integrationData: fullUser.integrations?.data || {},
          financialInsights: fullUser.integrations?.insights || {},
          financialSummary: fullUser.getFinancialSummary ? fullUser.getFinancialSummary() : {},
          connectedIntegrations: fullUser.integrations?.connected || []
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

// @route   POST /api/advisor/life-path-projection
// @desc    Generate AI-powered life path financial projection
// @access  Private
router.post('/life-path-projection', auth, requireOnboarding, async (req, res) => {
  try {
    const { userData, timeRange, currentAge, retirementAge } = req.body;
    
    console.log(`🔮 Life path projection request from ${req.user.firstName}`);
    
    // Get comprehensive user financial data
    let comprehensiveUserData = userData;
    if (!comprehensiveUserData) {
      const fullUser = await User.findById(req.user._id);
      const transactions = await Transaction.find({ userId: req.user._id })
        .sort({ date: -1 })
        .limit(100);
      const goals = await Goal.find({ userId: req.user._id });
      
      comprehensiveUserData = {
        ...fullUser.toObject(),
        recentTransactions: transactions,
        goals: goals,
        currentAge: fullUser.age || currentAge || 25,
        retirementAge: fullUser.retirementAge || retirementAge || 65
      };
    }
    
    // Generate life path projection using Gemini 2.5 Flash AI
    const projection = await aiAdvisor.generateLifePathProjection(
      comprehensiveUserData,
      timeRange
    );
    
    console.log(`✅ Gemini 2.5 Flash life path projection generated successfully`);
    res.json(projection);
    
  } catch (error) {
    console.error('❌ Life path projection error:', error.message);
    
    // Handle rate limiting and timeouts specifically
    if (error.message === 'RATE_LIMITED') {
      console.log('🚨 Gemini API rate limited, using enhanced fallback projection');
      const enhancedFallback = generateEnhancedFallbackLifeProjection(currentAge || 25, retirementAge || 65, req.user);
      res.json({
        ...enhancedFallback,
        fallback: true,
        reason: 'rate_limited',
        message: 'Using enhanced AI simulation due to API rate limits'
      });
      return;
    }
    
    // Handle timeout errors
    if (error.message === 'TIMEOUT' || error.message?.includes('timeout')) {
      console.log('⏰ Gemini API timeout detected, using enhanced fallback projection');
      const enhancedFallback = generateEnhancedFallbackLifeProjection(currentAge || 25, retirementAge || 65, req.user);
      res.json({
        ...enhancedFallback,
        fallback: true,
        reason: 'timeout',
        message: 'Using enhanced AI simulation due to API timeout'
      });
      return;
    }
    
    // Generate fallback projection for other errors
    console.log('📊 Using fallback projection due to AI service error');
    const fallbackProjection = generateFallbackLifeProjection(currentAge || 25, retirementAge || 65);
    res.json({
      ...fallbackProjection,
      fallback: true,
      reason: 'service_error'
    });
  }
});

// @route   POST /api/advisor/life-event-impact
// @desc    Calculate impact of a life event on financial trajectory
// @access  Private
router.post('/life-event-impact', auth, requireOnboarding, async (req, res) => {
  try {
    const { userData, baselineProjection, lifeEvent, eventAge, currentAge } = req.body;
    
    console.log(`📊 Life event impact analysis: "${lifeEvent}" at age ${eventAge}`);
    
    // Use AI to calculate life event impact
    const impactAnalysis = await aiAdvisor.calculateLifeEventImpact(
      userData,
      baselineProjection,
      lifeEvent,
      eventAge,
      currentAge
    );
    
    console.log(`✅ Life event impact calculated`);
    res.json(impactAnalysis);
    
  } catch (error) {
    console.error('Life event impact error:', error);
    
    // Generate fallback impact analysis
    const fallbackImpact = generateFallbackEventImpact(baselineProjection, lifeEvent, eventAge);
    res.json(fallbackImpact);
  }
});

// @route   GET /api/advisor/comprehensive-data
// @desc    Get comprehensive user financial data for AI analysis (simplified)
// @access  Private
router.get('/comprehensive-data', auth, async (req, res) => {
  try {
    console.log(`📊 Fetching comprehensive data for ${req.user.firstName || 'User'}`);
    
    const [user, transactions, goals] = await Promise.all([
      User.findById(req.user._id),
      Transaction.find({ userId: req.user._id }).sort({ date: -1 }).limit(200),
      Goal.find({ userId: req.user._id })
    ]);
    
    // Calculate spending patterns
    const monthlySpending = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            category: '$category'
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const comprehensiveData = {
      ...user.toObject(),
      transactions: transactions,
      goals: goals,
      spendingPatterns: monthlySpending,
      currentAge: user.age || 25,
      retirementAge: user.retirementAge || 65,
      financialSummary: user.getFinancialSummary ? user.getFinancialSummary() : {},
      integrationData: user.integrations?.data || {},
      insights: user.integrations?.insights || {}
    };
    
    res.json(comprehensiveData);
    
  } catch (error) {
    console.error('Comprehensive data fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch user data' });
  }
});

// @route   GET /api/advisor/users/:userId/comprehensive-data
// @desc    Get comprehensive user financial data for AI analysis
// @access  Private
router.get('/users/:userId/comprehensive-data', auth, async (req, res) => {
  try {
    console.log('Received userId param:', req.params.userId);
    console.log('User from auth:', req.user._id.toString());
    
    // If userId is undefined or doesn't match, still allow access for the authenticated user
    if (req.params.userId === 'undefined' || !req.params.userId || req.params.userId !== req.user._id.toString()) {
      console.log('Using authenticated user ID instead of param');
    }
    
    console.log(`📊 Fetching comprehensive data for ${req.user.firstName}`);
    
    const [user, transactions, goals] = await Promise.all([
      User.findById(req.user._id),
      Transaction.find({ userId: req.user._id }).sort({ date: -1 }).limit(200),
      Goal.find({ userId: req.user._id })
    ]);
    
    // Calculate spending patterns
    const monthlySpending = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            category: '$category'
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const comprehensiveData = {
      ...user.toObject(),
      transactions: transactions,
      goals: goals,
      spendingPatterns: monthlySpending,
      currentAge: user.age || 25,
      retirementAge: user.retirementAge || 65,
      financialSummary: user.getFinancialSummary ? user.getFinancialSummary() : {},
      integrationData: user.integrations?.data || {},
      insights: user.integrations?.insights || {}
    };
    
    res.json(comprehensiveData);
    
  } catch (error) {
    console.error('Comprehensive data fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch user data' });
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

function generateEnhancedFallbackLifeProjection(currentAge, retirementAge, user) {
  const projection = [];
  const sources = [
    "🚨 FALLBACK MODE ACTIVATED - AI API Failed",
    "Using zero projection to clearly show fallback state",
    "This indicates Gemini API timeout or error occurred"
  ];
  
  // Generate zero projection to clearly show fallback
  for (let age = currentAge; age <= retirementAge + 10; age++) {
    projection.push({
      age: age,
      year: new Date().getFullYear() + (age - currentAge),
      netWorth: 0 // Zero to clearly indicate fallback
    });
  }
  
  return {
    currentPath: projection,
    optimizedPath: projection, // Same zero projection for both
    sources: sources,
    keyMilestones: [{
      age: currentAge,
      milestone: "🚨 FALLBACK: AI API Failed",
      projectedNetWorth: 0
    }],
    assumptions: {
      fallbackMode: true,
      reason: "Gemini API timeout or error"
    },
    provider: 'fallback',
    timestamp: new Date()
  };
}

function generateFallbackLifeProjection(currentAge, retirementAge) {
  console.log('📊 Generating fallback life projection with ZERO values');
  
  const projection = [];
  const sources = [
    "🚨 FALLBACK MODE ACTIVATED - AI Service Error",
    "Using zero projection to clearly show fallback state",
    "This indicates the AI service failed to generate projections"
  ];
  
  // Generate zero projection to clearly show fallback
  for (let age = currentAge; age <= retirementAge + 10; age++) {
    projection.push({
      age: age,
      year: new Date().getFullYear() + (age - currentAge),
      netWorth: 0 // Always zero for fallback
    });
  }
  
  return {
    currentPath: projection,
    optimizedPath: projection, // Same zero projection for both paths
    sources: sources,
    keyMilestones: [{
      age: currentAge,
      milestone: "🚨 FALLBACK: AI Service Failed",
      projectedNetWorth: 0
    }],
    assumptions: {
      fallbackMode: true,
      reason: "AI service error - using zero projection"
    },
    provider: 'zero_fallback',
    timestamp: new Date()
  };
}
function generateFallbackEventImpact(baselineProjection, lifeEvent, eventAge) {
  const alternativeProjection = baselineProjection.map(point => {
    let adjustedNetWorth = point.netWorth;
    const event = lifeEvent.toLowerCase();
    
    // Apply event-specific impacts
    if (point.age >= eventAge) {
      if (event.includes('roth') || event.includes('ira') || event.includes('401k')) {
        // Retirement account - tax benefits and compound growth
        if (point.age < eventAge + 5) {
          adjustedNetWorth *= 0.95; // Slight short-term reduction
        } else {
          adjustedNetWorth *= 1.20; // Long-term tax benefits
        }
      } else if (event.includes('grad') || event.includes('school') || event.includes('mba') || event.includes('education')) {
        // Education - cost upfront, income boost later
        if (point.age < eventAge + 3) {
          adjustedNetWorth -= 75000; // Education cost
        } else {
          adjustedNetWorth *= 1.35; // Higher earning potential
        }
      } else if (event.includes('house') || event.includes('home') || event.includes('mortgage')) {
        // Home purchase - equity building and tax benefits
        if (point.age >= eventAge) {
          const equityBuilding = (point.age - eventAge) * 8000; // Annual equity gain
          adjustedNetWorth += equityBuilding;
        }
      } else if (event.includes('business') || event.includes('startup') || event.includes('entrepreneur')) {
        // Business venture - high risk, high reward
        if (point.age < eventAge + 3) {
          adjustedNetWorth -= 50000; // Initial investment
        } else if (point.age > eventAge + 5) {
          adjustedNetWorth *= 1.50; // Potential high returns
        }
      } else if (event.includes('child') || event.includes('baby') || event.includes('family')) {
        // Having children - ongoing costs
        const yearsWithChild = Math.max(0, point.age - eventAge);
        adjustedNetWorth -= yearsWithChild * 15000; // Annual child costs
      } else if (event.includes('car') || event.includes('vehicle')) {
        // Car purchase - depreciation and costs
        if (point.age >= eventAge && point.age < eventAge + 7) {
          adjustedNetWorth -= 30000 - (point.age - eventAge) * 3000; // Depreciation
        }
      }
    }
    
    return {
      ...point,
      netWorth: Math.max(0, Math.round(adjustedNetWorth))
    };
  });
  
  const eventSources = [
    `Life event "${lifeEvent}" modeled at age ${eventAge}`,
    "Impact calculations based on statistical averages and financial literature",
    "Actual results may vary based on individual circumstances",
    "Projections assume current economic conditions continue"
  ];
  
  return { alternativeProjection, eventSources };
}

// Test endpoints for debugging Gemini API
router.get('/test-gemini', async (req, res) => {
  console.log('🧪 Testing Gemini API directly...');
  
  try {
    console.log('📤 Testing Gemini life path projection...');
    
    const startTime = Date.now();
    
    // Test with simple user data
    const testUserData = {
      currentAge: 25,
      retirementAge: 30,
      financialProfile: {
        monthlyIncome: 5000,
        currentSavings: 15000
      }
    };
    
    // Try the AI service directly
    const geminiResponse = await aiAdvisor.generateLifePathProjection(testUserData);
    
    const endTime = Date.now();
    console.log(`⏱️ Gemini response time: ${endTime - startTime}ms`);
    console.log('🎯 Gemini raw response:', JSON.stringify(geminiResponse, null, 2));
    console.log('📊 Response type:', typeof geminiResponse);
    
    return res.json({
      success: true,
      responseTime: `${endTime - startTime}ms`,
      rawResponse: geminiResponse,
      responseType: typeof geminiResponse,
      message: 'Gemini test completed successfully'
    });
    
  } catch (error) {
    console.error('🚨 Gemini test failed:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack?.substring(0, 500));
    
    return res.status(500).json({
      success: false,
      error: error.message,
      errorType: error.name,
      errorDetails: error.stack?.substring(0, 500)
    });
  }
});

// Test Gemini model directly without wrapper
router.get('/test-gemini-direct', async (req, res) => {
  console.log('🧪 Testing Gemini model directly...');
  
  try {
    const { model } = aiAdvisor.getAvailableModel();
    
    if (!model) {
      throw new Error('No Gemini model available');
    }
    
    console.log('📤 Testing direct Gemini call...');
    const startTime = Date.now();
    
    // Direct model call with simple prompt
    const result = await model.invoke('Generate a simple JSON: {"test": "success", "timestamp": "now"}');
    
    const endTime = Date.now();
    console.log(`⏱️ Direct response time: ${endTime - startTime}ms`);
    console.log('🎯 Direct response:', result);
    
    return res.json({
      success: true,
      responseTime: `${endTime - startTime}ms`,
      directResponse: result,
      message: 'Direct Gemini test completed'
    });
    
  } catch (error) {
    console.error('🚨 Direct Gemini test failed:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      errorType: error.name
    });
  }
});

// Test AI service initialization
router.get('/test-ai-init', async (req, res) => {
  console.log('🤖 Testing AI service initialization...');
  
  try {
    // Check environment variables
    const hasGoogleKey = !!process.env.GOOGLE_API_KEY;
    console.log('🔑 Google API key present:', hasGoogleKey);
    
    if (!hasGoogleKey) {
      return res.json({
        success: false,
        error: 'GOOGLE_API_KEY not found in environment variables',
        envCheck: { GOOGLE_API_KEY: 'NOT_SET' }
      });
    }
    
    // Test model availability
    const { model, provider } = aiAdvisor.getAvailableModel();
    console.log('🎯 Available model:', provider);
    
    // Try a super simple call
    console.log('📤 Testing simple AI call...');
    const startTime = Date.now();
    
    const testResponse = await aiAdvisor.generateFinancialAdvice('Say hello in exactly 5 words.', { name: 'Test User' });
    
    const endTime = Date.now();
    console.log(`⏱️ AI response time: ${endTime - startTime}ms`);
    console.log('✅ AI response:', testResponse);
    
    return res.json({
      success: true,
      provider: provider,
      responseTime: `${endTime - startTime}ms`,
      testResponse: testResponse,
      envCheck: { GOOGLE_API_KEY: 'SET' }
    });
    
  } catch (error) {
    console.error('🚨 AI initialization test failed:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      errorType: error.name,
      envCheck: { GOOGLE_API_KEY: process.env.GOOGLE_API_KEY ? 'SET' : 'NOT_SET' }
    });
  }
});

module.exports = router;
