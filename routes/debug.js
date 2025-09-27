const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Goal = require('../models/Goal');
const Bet = require('../models/Bet');
const router = express.Router();

// @route   GET /api/debug/user-data
// @desc    Get complete user data for debugging (plain text format)
// @access  Private
router.get('/user-data', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get related data
    const transactions = await Transaction.find({ userId: req.user._id }).sort({ date: -1 }).limit(50);
    const goals = await Goal.find({ userId: req.user._id }).sort({ createdAt: -1 });
    const bets = await Bet.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20);

    // Format data for plain text display
    let debugOutput = '';
    debugOutput += '='.repeat(80) + '\n';
    debugOutput += '                    USER DATABASE DEBUG REPORT\n';
    debugOutput += '='.repeat(80) + '\n\n';

    // Basic User Info
    debugOutput += 'BASIC USER INFORMATION\n';
    debugOutput += '-'.repeat(40) + '\n';
    debugOutput += `User ID: ${user._id}\n`;
    debugOutput += `Name: ${user.firstName} ${user.lastName}\n`;
    debugOutput += `Email: ${user.email}\n`;
    debugOutput += `Created: ${user.createdAt}\n`;
    debugOutput += `Last Login: ${user.lastLogin}\n`;
    debugOutput += `Email Verified: ${user.emailVerified}\n`;
    debugOutput += `Profile Complete: ${user.profileComplete}\n\n`;

    // Onboarding Data
    debugOutput += 'ONBOARDING DATA\n';
    debugOutput += '-'.repeat(40) + '\n';
    if (user.onboarding) {
      debugOutput += `Age: ${user.onboarding.age || 'Not set'}\n`;
      debugOutput += `Life Stage: ${user.onboarding.lifeStage || 'Not set'}\n`;
      debugOutput += `Risk Tolerance: ${user.onboarding.riskTolerance || 'Not set'}\n`;
      debugOutput += `Primary Goals: ${user.onboarding.primaryGoals ? user.onboarding.primaryGoals.join(', ') : 'Not set'}\n`;
      debugOutput += `Time Horizon: ${user.onboarding.timeHorizon || 'Not set'}\n`;
      debugOutput += `Completed: ${user.onboarding.completed}\n`;
      debugOutput += `Completed At: ${user.onboarding.completedAt || 'Not completed'}\n`;
    } else {
      debugOutput += 'No onboarding data found\n';
    }
    debugOutput += '\n';

    // Financial Profile
    debugOutput += 'FINANCIAL PROFILE\n';
    debugOutput += '-'.repeat(40) + '\n';
    if (user.financialProfile) {
      debugOutput += `Monthly Income: $${user.financialProfile.monthlyIncome || 0}\n`;
      debugOutput += `Monthly Expenses: $${user.financialProfile.monthlyExpenses || 0}\n`;
      debugOutput += `Current Savings: $${user.financialProfile.currentSavings || 0}\n`;
      debugOutput += `Debt: $${user.financialProfile.debt || 0}\n`;
      debugOutput += `Credit Score: ${user.financialProfile.creditScore || 'Not set'}\n`;
    } else {
      debugOutput += 'No financial profile data found\n';
    }
    debugOutput += '\n';

    // Integration Data
    debugOutput += 'FINANCIAL INTEGRATIONS\n';
    debugOutput += '-'.repeat(40) + '\n';
    if (user.integrations && user.integrations.connected && user.integrations.connected.length > 0) {
      debugOutput += `Connected Integrations: ${user.integrations.connected.length}\n\n`;
      
      user.integrations.connected.forEach((integration, index) => {
        debugOutput += `${index + 1}. ${integration.provider.toUpperCase()} (${integration.type})\n`;
        debugOutput += `   Connected: ${integration.connectedAt}\n`;
        debugOutput += `   Last Sync: ${integration.lastSync}\n`;
        debugOutput += `   Status: ${integration.status}\n\n`;
      });

      // Integration Insights
      if (user.integrations.insights) {
        debugOutput += 'FINANCIAL INSIGHTS\n';
        debugOutput += '-'.repeat(30) + '\n';
        debugOutput += `Total Net Worth: $${user.integrations.insights.totalNetWorth || 0}\n`;
        debugOutput += `Total Investments: $${user.integrations.insights.totalInvestments || 0}\n`;
        debugOutput += `Total Debt: $${user.integrations.insights.totalDebt || 0}\n`;
        debugOutput += `Monthly Spending: $${user.integrations.insights.monthlySpending || 0}\n`;
        debugOutput += `Monthly Income: $${user.integrations.insights.monthlyIncome || 0}\n`;
        debugOutput += `Last Calculated: ${user.integrations.insights.lastCalculated}\n\n`;

        // Spending by Category
        if (user.integrations.insights.spendingByCategory && user.integrations.insights.spendingByCategory.length > 0) {
          debugOutput += 'SPENDING BY CATEGORY\n';
          debugOutput += '-'.repeat(30) + '\n';
          user.integrations.insights.spendingByCategory.forEach(category => {
            debugOutput += `${category.category}: $${category.amount} (${category.percentage?.toFixed(1)}%)\n`;
          });
          debugOutput += '\n';
        }

        // Investment Allocation
        if (user.integrations.insights.investmentAllocation && user.integrations.insights.investmentAllocation.length > 0) {
          debugOutput += 'INVESTMENT ALLOCATION\n';
          debugOutput += '-'.repeat(30) + '\n';
          user.integrations.insights.investmentAllocation.forEach(allocation => {
            debugOutput += `${allocation.assetClass}: $${allocation.amount} (${allocation.percentage?.toFixed(1)}%)\n`;
          });
          debugOutput += '\n';
        }
      }

      // Raw Integration Data Counts
      if (user.integrations.data) {
        debugOutput += 'RAW INTEGRATION DATA COUNTS\n';
        debugOutput += '-'.repeat(30) + '\n';
        Object.keys(user.integrations.data).forEach(dataType => {
          const count = user.integrations.data[dataType] ? user.integrations.data[dataType].length : 0;
          if (count > 0) {
            debugOutput += `${dataType}: ${count} records\n`;
          }
        });
        debugOutput += '\n';
      }
    } else {
      debugOutput += 'No integrations connected\n\n';
    }

    // Gamification Data
    debugOutput += 'GAMIFICATION DATA\n';
    debugOutput += '-'.repeat(40) + '\n';
    if (user.gamification) {
      debugOutput += `Level: ${user.gamification.level || 1}\n`;
      debugOutput += `Points: ${user.gamification.points || 0}\n`;
      debugOutput += `Current Streak: ${user.gamification.streak?.current || 0}\n`;
      debugOutput += `Best Streak: ${user.gamification.streak?.best || 0}\n`;
      debugOutput += `Successful Bets: ${user.gamification.successfulBets || 0}\n`;
      debugOutput += `Failed Bets: ${user.gamification.failedBets || 0}\n`;
      debugOutput += `Total Winnings: $${user.gamification.totalWinnings || 0}\n`;
      debugOutput += `Total Donated: $${user.gamification.totalDonated || 0}\n`;
    } else {
      debugOutput += 'No gamification data found\n';
    }
    debugOutput += '\n';

    // Recent Transactions
    debugOutput += 'RECENT TRANSACTIONS\n';
    debugOutput += '-'.repeat(40) + '\n';
    if (transactions.length > 0) {
      debugOutput += `Total Transactions: ${transactions.length}\n\n`;
      transactions.slice(0, 10).forEach((transaction, index) => {
        debugOutput += `${index + 1}. ${transaction.description || 'No description'}\n`;
        debugOutput += `   Amount: $${transaction.amount}\n`;
        debugOutput += `   Category: ${transaction.category || 'Uncategorized'}\n`;
        debugOutput += `   Date: ${transaction.date}\n`;
        debugOutput += `   Type: ${transaction.type || 'Unknown'}\n\n`;
      });
    } else {
      debugOutput += 'No transactions found\n\n';
    }

    // Goals
    debugOutput += 'FINANCIAL GOALS\n';
    debugOutput += '-'.repeat(40) + '\n';
    if (goals.length > 0) {
      debugOutput += `Total Goals: ${goals.length}\n\n`;
      goals.forEach((goal, index) => {
        debugOutput += `${index + 1}. ${goal.title}\n`;
        debugOutput += `   Target: $${goal.targetAmount || 0}\n`;
        debugOutput += `   Current: $${goal.currentAmount || 0}\n`;
        debugOutput += `   Progress: ${goal.targetAmount ? ((goal.currentAmount || 0) / goal.targetAmount * 100).toFixed(1) : 0}%\n`;
        debugOutput += `   Target Date: ${goal.targetDate || 'Not set'}\n`;
        debugOutput += `   Status: ${goal.status || 'active'}\n`;
        debugOutput += `   Priority: ${goal.priority || 'medium'}\n\n`;
      });
    } else {
      debugOutput += 'No goals found\n\n';
    }

    // Recent Bets
    debugOutput += 'RECENT BETS\n';
    debugOutput += '-'.repeat(40) + '\n';
    if (bets.length > 0) {
      debugOutput += `Total Bets: ${bets.length}\n\n`;
      bets.slice(0, 10).forEach((bet, index) => {
        debugOutput += `${index + 1}. ${bet.description}\n`;
        debugOutput += `   Amount: $${bet.amount}\n`;
        debugOutput += `   Status: ${bet.status}\n`;
        debugOutput += `   Deadline: ${bet.deadline}\n`;
        debugOutput += `   Created: ${bet.createdAt}\n\n`;
      });
    } else {
      debugOutput += 'No bets found\n\n';
    }

    debugOutput += '='.repeat(80) + '\n';
    debugOutput += '                           END OF REPORT\n';
    debugOutput += '='.repeat(80) + '\n';

    res.setHeader('Content-Type', 'text/plain');
    res.send(debugOutput);

  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ message: 'Failed to fetch debug data' });
  }
});

// @route   GET /api/debug/user-data-json
// @desc    Get complete user data for debugging (JSON format)
// @access  Private
router.get('/user-data-json', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const transactions = await Transaction.find({ userId: req.user._id }).sort({ date: -1 }).limit(50);
    const goals = await Goal.find({ userId: req.user._id }).sort({ createdAt: -1 });
    const bets = await Bet.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20);

    res.json({
      user: user,
      transactions: transactions,
      goals: goals,
      bets: bets,
      summary: {
        totalTransactions: transactions.length,
        totalGoals: goals.length,
        totalBets: bets.length,
        connectedIntegrations: user.integrations?.connected?.length || 0,
        hasOnboardingData: !!user.onboarding?.completed,
        hasFinancialProfile: !!(user.financialProfile?.monthlyIncome || user.financialProfile?.currentSavings),
        netWorth: user.integrations?.insights?.totalNetWorth || 0
      }
    });

  } catch (error) {
    console.error('Debug JSON endpoint error:', error);
    res.status(500).json({ message: 'Failed to fetch debug data' });
  }
});

module.exports = router;