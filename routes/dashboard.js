const express = require('express');
const User = require('../models/User');
const Goal = require('../models/Goal');
const Bet = require('../models/Bet');
const Transaction = require('../models/Transaction');
const Visualization = require('../models/Visualization');
const { auth, requireOnboarding } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/dashboard/overview
// @desc    Get dashboard overview data
// @access  Private
router.get('/overview', auth, requireOnboarding, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user with financial profile
    const user = await User.findById(userId).select('-password');
    
    // Get date ranges
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last12Months = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    
    // Get active goals
    const activeGoals = await Goal.find({
      userId,
      status: 'active'
    }).sort({ priority: -1, targetDate: 1 });
    
    // Get active bets
    const activeBets = await Bet.find({
      userId,
      status: 'active'
    }).sort({ endDate: 1 });
    
    // Get recent transactions
    const recentTransactions = await Transaction.find({
      userId,
      date: { $gte: last30Days }
    }).sort({ date: -1 }).limit(10);
    
    // Calculate spending by category (current month)
    const categorySpending = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          type: 'expense',
          date: { $gte: currentMonth, $lte: now }
        }
      },
      {
        $group: {
          _id: '$category.primary',
          total: { $sum: { $abs: '$amount' } },
          count: { $sum: 1 },
          average: { $avg: { $abs: '$amount' } }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);
    
    // Calculate monthly trends
    const monthlyTrends = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: last12Months }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    // Calculate financial metrics
    const netWorth = user.calculateNetWorth();
    const monthlyIncome = user.financialProfile.monthlyIncome || 0;
    const monthlyExpenses = user.financialProfile.monthlyExpenses || 0;
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome * 100) : 0;
    
    // Calculate current month income and expenses
    const currentMonthTransactions = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: currentMonth, $lte: now }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    const currentMonthIncome = currentMonthTransactions.find(t => t._id === 'income')?.total || 0;
    const currentMonthExpenses = Math.abs(currentMonthTransactions.find(t => t._id === 'expense')?.total || 0);
    
    // Project future net worth (simple linear projection)
    const monthlySavings = monthlyIncome - monthlyExpenses;
    const projectedNetWorth = {
      oneYear: netWorth + (monthlySavings * 12),
      fiveYear: netWorth + (monthlySavings * 60),
      tenYear: netWorth + (monthlySavings * 120)
    };
    
    // Calculate goal progress
    const goalProgress = activeGoals.map(goal => ({
      id: goal._id,
      title: goal.title,
      progress: goal.progress.percentage,
      daysRemaining: goal.getDaysRemaining(),
      isOnTrack: goal.isOnTrack(),
      requiredDaily: goal.getRequiredDailySavings()
    }));
    
    // Calculate bet progress
    const betProgress = activeBets.map(bet => ({
      id: bet._id,
      title: bet.title,
      progress: bet.progressPercentage,
      daysRemaining: bet.daysRemaining,
      isOnTrack: bet.isOnTrack(),
      stakeAmount: bet.stakeAmount
    }));
    
    // Generate AI insights (simplified)
    const insights = [];
    
    // Spending insights
    if (categorySpending.length > 0) {
      const topCategory = categorySpending[0];
      if (topCategory.total > monthlyIncome * 0.3) {
        insights.push({
          type: 'warning',
          title: 'High Spending Alert',
          message: `You're spending ${Math.round(topCategory.total / monthlyIncome * 100)}% of your income on ${topCategory._id}`,
          action: 'Review your spending in this category'
        });
      }
    }
    
    // Savings insights
    if (savingsRate < 10) {
      insights.push({
        type: 'opportunity',
        title: 'Boost Your Savings',
        message: `Your current savings rate is ${Math.round(savingsRate)}%. Financial experts recommend 20%`,
        action: 'Set up automatic transfers to savings'
      });
    }
    
    // Goal insights
    const behindGoals = goalProgress.filter(g => !g.isOnTrack).length;
    if (behindGoals > 0) {
      insights.push({
        type: 'reminder',
        title: 'Goal Check-in',
        message: `${behindGoals} of your goals need attention`,
        action: 'Review and adjust your goal strategies'
      });
    }
    
    res.json({
      overview: {
        user: {
          name: user.getDisplayName(),
          level: user.gamification.level,
          points: user.gamification.points,
          streak: user.gamification.streak.current
        },
        financialSummary: {
          netWorth,
          monthlyIncome,
          monthlyExpenses,
          savingsRate: Math.round(savingsRate * 100) / 100,
          currentMonthIncome,
          currentMonthExpenses,
          availableToSave: monthlyIncome - monthlyExpenses
        },
        projections: {
          netWorth: projectedNetWorth
        },
        goals: {
          active: activeGoals.length,
          progress: goalProgress,
          totalTargetAmount: activeGoals.reduce((sum, goal) => sum + goal.targetAmount, 0),
          totalCurrentAmount: activeGoals.reduce((sum, goal) => sum + goal.currentAmount, 0)
        },
        bets: {
          active: activeBets.length,
          progress: betProgress,
          totalStaked: activeBets.reduce((sum, bet) => sum + bet.stakeAmount, 0)
        },
        spending: {
          categories: categorySpending,
          trends: monthlyTrends,
          recentTransactions: recentTransactions.slice(0, 5)
        },
        insights
      }
    });
    
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      message: 'Server error fetching dashboard data'
    });
  }
});

// @route   GET /api/dashboard/charts/:type
// @desc    Get specific chart data
// @access  Private
router.get('/charts/:type', auth, requireOnboarding, async (req, res) => {
  try {
    const { type } = req.params;
    const { timeRange = '30d', category } = req.query;
    const userId = req.user._id;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    let chartData = {};
    
    switch (type) {
      case 'spending-pie':
        const spendingData = await Transaction.aggregate([
          {
            $match: {
              userId: userId,
              type: 'expense',
              date: { $gte: startDate, $lte: now }
            }
          },
          {
            $group: {
              _id: '$category.primary',
              total: { $sum: { $abs: '$amount' } }
            }
          },
          {
            $sort: { total: -1 }
          }
        ]);
        
        chartData = {
          labels: spendingData.map(item => item._id),
          datasets: [{
            data: spendingData.map(item => item.total),
            backgroundColor: [
              '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
              '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
            ]
          }]
        };
        break;
        
      case 'income-expense-line':
        const dailyTrends = await Transaction.aggregate([
          {
            $match: {
              userId: userId,
              date: { $gte: startDate, $lte: now }
            }
          },
          {
            $group: {
              _id: {
                date: {
                  $dateToString: { format: "%Y-%m-%d", date: "$date" }
                },
                type: '$type'
              },
              total: { $sum: '$amount' }
            }
          },
          {
            $sort: { '_id.date': 1 }
          }
        ]);
        
        // Process data for line chart
        const dateMap = {};
        dailyTrends.forEach(item => {
          if (!dateMap[item._id.date]) {
            dateMap[item._id.date] = { income: 0, expense: 0 };
          }
          dateMap[item._id.date][item._id.type] = Math.abs(item.total);
        });
        
        const sortedDates = Object.keys(dateMap).sort();
        
        chartData = {
          labels: sortedDates,
          datasets: [
            {
              label: 'Income',
              data: sortedDates.map(date => dateMap[date].income),
              borderColor: '#4BC0C0',
              backgroundColor: 'rgba(75, 192, 192, 0.1)',
              fill: false
            },
            {
              label: 'Expenses',
              data: sortedDates.map(date => dateMap[date].expense),
              borderColor: '#FF6384',
              backgroundColor: 'rgba(255, 99, 132, 0.1)',
              fill: false
            }
          ]
        };
        break;
        
      case 'goal-progress':
        const goals = await Goal.find({
          userId,
          status: 'active'
        }).select('title targetAmount currentAmount');
        
        chartData = {
          labels: goals.map(goal => goal.title),
          datasets: [{
            label: 'Progress',
            data: goals.map(goal => (goal.currentAmount / goal.targetAmount * 100)),
            backgroundColor: goals.map(goal => 
              goal.currentAmount >= goal.targetAmount ? '#4BC0C0' : '#36A2EB'
            )
          }]
        };
        break;
        
      default:
        return res.status(400).json({ message: 'Invalid chart type' });
    }
    
    res.json({
      chartType: type,
      timeRange,
      data: chartData,
      generatedAt: new Date()
    });
    
  } catch (error) {
    console.error('Chart data error:', error);
    res.status(500).json({
      message: 'Server error generating chart data'
    });
  }
});

// @route   GET /api/dashboard/insights
// @desc    Get AI-generated insights
// @access  Private
router.get('/insights', auth, requireOnboarding, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    // Get recent transaction data for analysis
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const transactions = await Transaction.find({
      userId,
      date: { $gte: last30Days }
    });
    
    const goals = await Goal.find({ userId, status: 'active' });
    const bets = await Bet.find({ userId, status: 'active' });
    
    // Generate insights based on data patterns
    const insights = [];
    
    // Spending pattern insights
    const categorySpending = {};
    let totalSpending = 0;
    
    transactions.forEach(t => {
      if (t.type === 'expense') {
        const category = t.category.primary;
        categorySpending[category] = (categorySpending[category] || 0) + Math.abs(t.amount);
        totalSpending += Math.abs(t.amount);
      }
    });
    
    // Find highest spending category
    const topSpendingCategory = Object.entries(categorySpending)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (topSpendingCategory && topSpendingCategory[1] > totalSpending * 0.4) {
      insights.push({
        type: 'spending_pattern',
        title: 'Spending Concentration Alert',
        message: `${Math.round(topSpendingCategory[1] / totalSpending * 100)}% of your spending is on ${topSpendingCategory[0]}`,
        recommendation: 'Consider diversifying your expenses or finding ways to reduce this category',
        severity: 'medium',
        amount: topSpendingCategory[1]
      });
    }
    
    // Goal progress insights
    goals.forEach(goal => {
      const daysRemaining = goal.getDaysRemaining();
      const isOnTrack = goal.isOnTrack();
      
      if (!isOnTrack && daysRemaining > 0) {
        const requiredDaily = goal.getRequiredDailySavings();
        insights.push({
          type: 'goal_progress',
          title: `${goal.title} - Behind Schedule`,
          message: `You need to save $${requiredDaily.toFixed(2)} daily to reach this goal`,
          recommendation: 'Consider increasing your contribution or extending the deadline',
          severity: 'high',
          goalId: goal._id
        });
      }
    });
    
    // Savings rate insight
    const monthlyIncome = user.financialProfile.monthlyIncome || 0;
    const monthlyExpenses = user.financialProfile.monthlyExpenses || 0;
    const savingsRate = monthlyIncome > 0 ? (monthlyIncome - monthlyExpenses) / monthlyIncome : 0;
    
    if (savingsRate < 0.1) {
      insights.push({
        type: 'savings_rate',
        title: 'Low Savings Rate',
        message: `Your savings rate is ${Math.round(savingsRate * 100)}%. Experts recommend 20% minimum`,
        recommendation: 'Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings',
        severity: 'medium',
        currentRate: Math.round(savingsRate * 100)
      });
    }
    
    // Debt insights
    if (user.financialProfile.debt > 0) {
      const debtToIncomeRatio = user.financialProfile.debt / (monthlyIncome * 12);
      if (debtToIncomeRatio > 0.4) {
        insights.push({
          type: 'debt_management',
          title: 'High Debt-to-Income Ratio',
          message: `Your debt is ${Math.round(debtToIncomeRatio * 100)}% of your annual income`,
          recommendation: 'Focus on debt repayment using the avalanche or snowball method',
          severity: 'high',
          debtAmount: user.financialProfile.debt
        });
      }
    }
    
    // Bet performance insights
    bets.forEach(bet => {
      const daysRemaining = bet.daysRemaining;
      if (daysRemaining <= 7 && bet.currentValue < bet.targetValue * 0.8) {
        insights.push({
          type: 'bet_warning',
          title: `Bet Alert: ${bet.title}`,
          message: `Only ${daysRemaining} days left and you're at ${bet.progressPercentage}% progress`,
          recommendation: 'Time to push harder or risk losing your stake!',
          severity: 'urgent',
          betId: bet._id
        });
      }
    });
    
    res.json({
      insights,
      generatedAt: new Date(),
      totalInsights: insights.length,
      severityBreakdown: {
        urgent: insights.filter(i => i.severity === 'urgent').length,
        high: insights.filter(i => i.severity === 'high').length,
        medium: insights.filter(i => i.severity === 'medium').length,
        low: insights.filter(i => i.severity === 'low').length
      }
    });
    
  } catch (error) {
    console.error('Insights generation error:', error);
    res.status(500).json({
      message: 'Server error generating insights'
    });
  }
});

module.exports = router;
