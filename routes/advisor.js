const express = require('express');
const { auth, requireOnboarding, rateLimitRequests } = require('../middleware/auth');

const router = express.Router();

// This is a simplified version - in a real app, you'd integrate with LangChain
// and actual LLM APIs (OpenAI, Anthropic, Google)

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
    
    // In a real implementation, you would:
    // 1. Get user's financial data
    // 2. Prepare context for the LLM
    // 3. Call LangChain with the user's question
    // 4. Generate visualization if needed
    // 5. Return response with insights
    
    // For now, provide a mock response
    const mockResponse = generateMockAdvisorResponse(message, req.user);
    
    res.json({
      response: mockResponse.text,
      visualization: mockResponse.visualization,
      insights: mockResponse.insights,
      suggestions: mockResponse.suggestions,
      timestamp: new Date()
    });
    
  } catch (error) {
    console.error('Advisor chat error:', error);
    res.status(500).json({
      message: 'Error processing your request. Please try again.'
    });
  }
});

// @route   POST /api/advisor/analyze-spending
// @desc    Analyze spending patterns
// @access  Private
router.post('/analyze-spending', auth, requireOnboarding, async (req, res) => {
  try {
    const { timeRange = '30d', category } = req.body;
    
    // Mock analysis response
    const analysis = {
      summary: `Based on your spending in the last ${timeRange}, here's what I found:`,
      insights: [
        "You're spending 40% more on dining out compared to last month",
        "Your transportation costs have decreased by 15% - great job!",
        "Consider setting up automatic savings transfers on payday"
      ],
      recommendations: [
        {
          category: 'food',
          current: 850,
          recommended: 600,
          strategy: 'Try meal prepping on Sundays to reduce restaurant visits'
        }
      ],
      visualization: {
        type: 'spending-comparison',
        data: {
          labels: ['Food', 'Transport', 'Entertainment', 'Shopping'],
          currentMonth: [850, 200, 300, 400],
          lastMonth: [600, 235, 280, 450]
        }
      }
    };
    
    res.json(analysis);
    
  } catch (error) {
    console.error('Spending analysis error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/advisor/goal-optimization
// @desc    Get advice on goal optimization
// @access  Private
router.post('/goal-optimization', auth, requireOnboarding, async (req, res) => {
  try {
    const { goalId } = req.body;
    
    // Mock goal optimization advice
    const advice = {
      goalTitle: "Emergency Fund",
      currentProgress: 65,
      recommendations: [
        "Increase your monthly contribution by $50 to reach your goal 2 months earlier",
        "Consider moving funds from low-yield savings to a high-yield account",
        "Reduce subscription spending by $25/month to boost savings"
      ],
      projectedCompletion: "February 2026",
      optimizedCompletion: "December 2025",
      visualization: {
        type: 'goal-projection',
        data: {
          labels: ['Current Pace', 'Optimized Pace'],
          datasets: [{
            label: 'Goal Progress',
            data: [65, 85]
          }]
        }
      }
    };
    
    res.json(advice);
    
  } catch (error) {
    console.error('Goal optimization error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to generate mock advisor responses
function generateMockAdvisorResponse(message, user) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('save') || lowerMessage.includes('saving')) {
    return {
      text: `Great question about saving! Based on your financial profile, I recommend following the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings. With your current income of $${user.financialProfile.monthlyIncome || 0}, you should aim to save $${Math.round((user.financialProfile.monthlyIncome || 0) * 0.2)} monthly.`,
      insights: [
        "You're currently saving below the recommended 20%",
        "Setting up automatic transfers can help build consistency",
        "Consider opening a high-yield savings account"
      ],
      suggestions: [
        "Set up automatic weekly transfers of $50 to savings",
        "Review your subscriptions and cancel unused ones",
        "Try the 'pay yourself first' strategy"
      ],
      visualization: {
        type: 'savings-projection',
        data: {
          labels: ['Month 1', 'Month 6', 'Month 12'],
          datasets: [{
            label: 'Projected Savings',
            data: [0, 1000, 2400]
          }]
        }
      }
    };
  }
  
  if (lowerMessage.includes('debt') || lowerMessage.includes('pay off')) {
    return {
      text: `Let's tackle your debt strategically! With $${user.financialProfile.debt || 0} in debt, I recommend using either the debt snowball (pay minimums on all debts, extra on smallest) or debt avalanche (pay minimums on all debts, extra on highest interest rate) method.`,
      insights: [
        "Your debt-to-income ratio could be improved",
        "Focus on high-interest debt first to save money long-term",
        "Consider debt consolidation if you have multiple high-rate debts"
      ],
      suggestions: [
        "List all debts with balances and interest rates",
        "Pay minimum on all, extra on highest rate",
        "Consider a side hustle to accelerate payoff"
      ]
    };
  }
  
  if (lowerMessage.includes('invest') || lowerMessage.includes('investment')) {
    return {
      text: `Investing is a great way to build wealth! As a ${user.onboarding.lifeStage}, I recommend starting with low-cost index funds. Given your risk tolerance is ${user.onboarding.riskTolerance}, here's what I suggest...`,
      insights: [
        "Time in the market beats timing the market",
        "Diversification reduces risk without sacrificing returns",
        "Start with broad market index funds"
      ],
      suggestions: [
        "Open a Roth IRA if you don't have one",
        "Invest in low-cost index funds (VTIAX, VTSAX)",
        "Automate monthly investments of $200-500"
      ]
    };
  }
  
  // Default response
  return {
    text: `I understand you're asking about "${message}". Based on your financial situation, let me provide some personalized advice. Your current net worth is $${user.calculateNetWorth()}, and there are several ways we can work together to improve your financial health.`,
    insights: [
      "Your financial profile shows room for improvement",
      "Setting clear goals will help track progress",
      "Regular check-ins can keep you on track"
    ],
    suggestions: [
      "Consider setting up a monthly financial review",
      "Track all expenses for better awareness",
      "Set specific, measurable financial goals"
    ]
  };
}

module.exports = router;
