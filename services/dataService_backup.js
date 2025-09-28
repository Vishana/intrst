const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Goal = require('../models/Goal');
const Bet = require('../models/Bet');
const Visualization = require('../models/Visualization');

class DatabaseService {
  constructor() {
    console.log('🗄️ DatabaseService initialized');
  }

  /**
   * Get comprehensive user financial data for AI analysis - PRIORITIZING INTEGRATIONS
   */
  async getUserFinancialData(userId) {
    try {
      console.log(`📊 Fetching financial data for user: ${userId} - PRIORITIZING INTEGRATIONS`);
      
      // Fetch user profile with populated financial data
      const user = await User.findById(userId).lean();
      if (!user) {
        throw new Error('User not found');
      }

      console.log(`🔍 User integrations status:`, {
        hasIntegrations: !!user.integrations,
        connectedAccounts: user.integrations?.connected?.length || 0,
        hasSpendingData: user.integrations?.data?.spending?.length || 0,
        hasInvestmentData: user.integrations?.data?.investment?.length || 0,
        hasRetirementData: user.integrations?.data?.retirement?.length || 0,
        hasInsights: !!user.integrations?.insights
      });

      // Get recent transactions (last 6 months) - but prioritize integrations data
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const transactions = await Transaction.find({
        userId: userId,
        date: { $gte: sixMonthsAgo }
      }).sort({ date: -1 }).limit(500).lean();

      // Get goals (optional)
      const goals = await Goal.find({
        userId: userId,
        status: 'active'
      }).lean();

      // Get recent bets
      const bets = await Bet.find({
        userId: userId,
        createdAt: { $gte: sixMonthsAgo }
      }).lean();

      // Get user's saved visualizations
      const visualizations = await Visualization.find({
        userId: userId,
        savedToSidebar: true
      }).sort({ lastViewed: -1 }).limit(10).lean();

      // ✅ NEW: Process integrations data as primary transaction source
      let integrationsTransactions = [];
      if (user.integrations?.data?.spending && user.integrations.data.spending.length > 0) {
        console.log(`💳 Processing ${user.integrations.data.spending.length} integration spending records`);
        integrationsTransactions = this.processIntegrationsSpending(user.integrations.data.spending);
      }

      // ✅ NEW: Combine all financial data sources
      const allTransactions = [
        ...transactions, // Manual transactions
        ...integrationsTransactions // Integration data converted to transaction format
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      console.log(`📊 Total financial data: ${transactions.length} manual + ${integrationsTransactions.length} integration = ${allTransactions.length} total transactions`);

      const financialData = {
        userProfile: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          onboarding: user.onboarding,
          financialProfile: user.financialProfile,
          preferences: user.preferences,
          gamification: user.gamification,
          integrations: user.integrations // ✅ Full integrations data included
        },
        recentTransactions: allTransactions, // ✅ Combined transactions including integrations
        currentGoals: goals,
        bets: bets,
        visualizations: visualizations,
        // ✅ Enhanced financial summary using integrations insights
        summary: this.calculateEnhancedFinancialSummary(user, allTransactions, goals),
        // ✅ Raw integrations data for AI context
        integrationsData: {
          spending: user.integrations?.data?.spending || [],
          investment: user.integrations?.data?.investment || [],
          retirement: user.integrations?.data?.retirement || [],
          insights: user.integrations?.insights || {},
          connectedAccounts: user.integrations?.connected || []
        }
      };

      console.log(`✅ Enhanced financial data retrieved for ${userId} with integrations priority`);
      return financialData;

    } catch (error) {
      console.error(`❌ Error fetching financial data for user ${userId}:`, error);
      throw new Error(`Failed to fetch financial data: ${error.message}`);
    }
  }

  /**
   * ✅ NEW: Process integrations spending data into transaction format
   */
  processIntegrationsSpending(spendingData) {
    console.log('💳 Processing integrations spending data...');
    
    return spendingData.map(spending => ({
      _id: `integration_${spending._id || Date.now()}_${Math.random()}`,
      userId: null, // Will be set by caller
      amount: spending.amount < 0 ? spending.amount : -Math.abs(spending.amount), // Ensure expenses are negative
      description: spending.description || spending.merchant || 'Integration Transaction',
      date: new Date(spending.date),
      category: {
        primary: this.mapIntegrationCategory(spending.category)
      },
      type: spending.amount > 0 ? 'income' : 'expense',
      source: 'integration',
      merchant: {
        name: spending.merchant || '',
        location: spending.location || ''
      },
      integration: {
        provider: spending.provider,
        originalData: spending
      }
    }));
  }

  /**
   * ✅ NEW: Map integration categories to our standard categories
   */
  mapIntegrationCategory(category) {
    if (!category) return 'other';
    
    const categoryMap = {
      // Common integration categories to our categories
      'Food': 'food',
      'Dining': 'food',
      'Restaurants': 'food',
      'Groceries': 'food',
      'Transportation': 'transportation',
      'Gas': 'transportation',
      'Automotive': 'transportation',
      'Housing': 'housing',
      'Rent': 'housing',
      'Mortgage': 'housing',
      'Utilities': 'utilities',
      'Electric': 'utilities',
      'Internet': 'utilities',
      'Entertainment': 'entertainment',
      'Movies': 'entertainment',
      'Music': 'entertainment',
      'Shopping': 'shopping',
      'Retail': 'shopping',
      'Online': 'shopping',
      'Health': 'healthcare',
      'Medical': 'healthcare',
      'Fitness': 'healthcare',
      'Travel': 'travel',
      'Hotels': 'travel',
      'Flights': 'travel',
      'Education': 'education',
      'Books': 'education',
      'Subscriptions': 'subscription',
      'Software': 'subscription',
      'Insurance': 'insurance'
    };

    const lowerCategory = category.toLowerCase();
    for (const [key, value] of Object.entries(categoryMap)) {
      if (lowerCategory.includes(key.toLowerCase())) {
        return value;
      }
    }
    
    return 'other';
  }

  /**
   * ✅ ENHANCED: Calculate financial summary with integrations insights priority
   */
  calculateEnhancedFinancialSummary(user, transactions, goals) {
    console.log('🔢 Calculating enhanced financial summary with integrations data...');
    
    const summary = {
      totalTransactions: transactions.length,
      totalGoals: goals.length,
      netWorth: 0,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      savings: 0,
      spendingByCategory: {},
      goalProgress: {},
      topSpendingCategories: [],
      incomeVsExpenses: {},
      trends: {},
      dataSource: 'hybrid' // Indicates mixed data sources
    };

    // ✅ PRIORITY: Use integrations insights if available
    if (user.integrations && user.integrations.insights) {
      console.log('💡 Using integrations insights as primary data source');
      const insights = user.integrations.insights;
      
      summary.netWorth = insights.totalNetWorth || 0;
      summary.monthlyIncome = insights.monthlyIncome || 0;
      summary.monthlyExpenses = insights.monthlySpending || 0;
      summary.savings = summary.monthlyIncome - summary.monthlyExpenses;
      summary.dataSource = 'integrations';

      // Use integrations spending categories if available
      if (insights.spendingByCategory && insights.spendingByCategory.length > 0) {
        insights.spendingByCategory.forEach(cat => {
          summary.spendingByCategory[cat.category] = {
            total: cat.amount,
            percentage: cat.percentage,
            source: 'integrations'
          };
        });
        
        summary.topSpendingCategories = insights.spendingByCategory
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 10)
          .map(cat => ({
            category: cat.category,
            total: cat.amount,
            percentage: cat.percentage,
            source: 'integrations'
          }));
      }
    }

    // ✅ FALLBACK: Calculate from user profile
    if (!summary.netWorth && user.financialProfile) {
      console.log('📊 Falling back to user financial profile data');
      summary.netWorth = (user.financialProfile.currentSavings || 0) - (user.financialProfile.debt || 0);
      summary.monthlyIncome = user.financialProfile.monthlyIncome || 0;
      summary.monthlyExpenses = user.financialProfile.monthlyExpenses || 0;
      summary.savings = summary.monthlyIncome - summary.monthlyExpenses;
      summary.dataSource = summary.dataSource === 'integrations' ? 'hybrid' : 'profile';
    }

    // ✅ ENHANCE: Process transaction data (including integrations transactions)
    if (transactions && transactions.length > 0) {
      console.log(`📈 Processing ${transactions.length} transactions (including integrations)`);
      
      const categoryTotals = {};
      const monthlyData = {};
      let totalIncome = 0;
      let totalExpenses = 0;
      let integrationCount = 0;

      transactions.forEach(transaction => {
        if (transaction.source === 'integration') integrationCount++;
        
        const category = transaction.category?.primary || 'other';
        const amount = Math.abs(transaction.amount);
        const month = transaction.date.toISOString().substring(0, 7); // YYYY-MM

        // Category analysis
        if (!categoryTotals[category]) {
          categoryTotals[category] = { 
            total: 0, 
            count: 0, 
            transactions: [],
            integrationCount: 0
          };
        }
        categoryTotals[category].total += amount;
        categoryTotals[category].count += 1;
        if (transaction.source === 'integration') {
          categoryTotals[category].integrationCount += 1;
        }
        categoryTotals[category].transactions.push(transaction);

        // Monthly analysis
        if (!monthlyData[month]) {
          monthlyData[month] = { income: 0, expenses: 0, net: 0 };
        }

        if (transaction.type === 'income' || transaction.amount > 0) {
          totalIncome += amount;
          monthlyData[month].income += amount;
        } else {
          totalExpenses += amount;
          monthlyData[month].expenses += amount;
        }
        monthlyData[month].net = monthlyData[month].income - monthlyData[month].expenses;
      });

      console.log(`📊 Processed transactions: ${integrationCount} from integrations, ${transactions.length - integrationCount} manual`);

      // Update spending categories if we have transaction data
      if (Object.keys(categoryTotals).length > 0) {
        summary.topSpendingCategories = Object.entries(categoryTotals)
          .filter(([category]) => category !== 'income')
          .map(([category, data]) => ({
            category,
            total: data.total,
            count: data.count,
            average: data.total / data.count,
            percentage: totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0,
            integrationData: data.integrationCount > 0,
            source: 'transactions'
          }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 10);

        summary.spendingByCategory = categoryTotals;
        summary.incomeVsExpenses = { totalIncome, totalExpenses, net: totalIncome - totalExpenses };
        summary.trends = monthlyData;
      }
    }

    // ✅ GOALS: Process goals if available
    if (goals && goals.length > 0) {
      goals.forEach(goal => {
        summary.goalProgress[goal.title] = {
          progress: goal.progress?.percentage || 0,
          currentAmount: goal.currentAmount || 0,
          targetAmount: goal.targetAmount || 0,
          daysRemaining: Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24)),
          category: goal.category
        };
      });
    }

    console.log(`✅ Enhanced summary complete: ${summary.dataSource} data, ${summary.topSpendingCategories.length} categories`);
    return summary;
  }
      return financialData;

    } catch (error) {
      console.error('❌ Error fetching user financial data:', error.message);
      throw error;
    }
  }

  /**
   * Calculate financial summary metrics
   */
  calculateFinancialSummary(user, transactions, goals) {
    const summary = {
      totalTransactions: transactions.length,
      totalGoals: goals.length,
      netWorth: 0,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      savings: 0,
      spendingByCategory: {},
      goalProgress: {},
      topSpendingCategories: [],
      incomeVsExpenses: {},
      trends: {}
    };

    // Calculate from user profile
    if (user.financialProfile) {
      summary.netWorth = (user.financialProfile.currentSavings || 0) - (user.financialProfile.debt || 0);
      summary.monthlyIncome = user.financialProfile.monthlyIncome || 0;
      summary.monthlyExpenses = user.financialProfile.monthlyExpenses || 0;
      summary.savings = summary.monthlyIncome - summary.monthlyExpenses;
    }

    // Calculate from integration insights if available
    if (user.integrations && user.integrations.insights) {
      const insights = user.integrations.insights;
      summary.netWorth = insights.totalNetWorth || summary.netWorth;
      summary.monthlyIncome = insights.monthlyIncome || summary.monthlyIncome;
      summary.monthlyExpenses = insights.monthlySpending || summary.monthlyExpenses;
      summary.spendingByCategory = insights.spendingByCategory || {};
    }

    // Process transactions
    if (transactions && transactions.length > 0) {
      const categoryTotals = {};
      const monthlyData = {};
      let totalIncome = 0;
      let totalExpenses = 0;

      transactions.forEach(transaction => {
        const category = transaction.category?.primary || 'other';
        const amount = Math.abs(transaction.amount);
        const month = transaction.date.toISOString().substring(0, 7); // YYYY-MM

        // Category analysis
        if (!categoryTotals[category]) {
          categoryTotals[category] = { total: 0, count: 0, transactions: [] };
        }
        categoryTotals[category].total += amount;
        categoryTotals[category].count += 1;
        categoryTotals[category].transactions.push(transaction);

        // Monthly analysis
        if (!monthlyData[month]) {
          monthlyData[month] = { income: 0, expenses: 0, net: 0 };
        }

        if (transaction.type === 'income' || transaction.amount > 0) {
          totalIncome += amount;
          monthlyData[month].income += amount;
        } else {
          totalExpenses += amount;
          monthlyData[month].expenses += amount;
        }
        monthlyData[month].net = monthlyData[month].income - monthlyData[month].expenses;
      });

      // Sort categories by spending
      summary.topSpendingCategories = Object.entries(categoryTotals)
        .filter(([category]) => category !== 'income')
        .map(([category, data]) => ({
          category,
          total: data.total,
          count: data.count,
          average: data.total / data.count,
          percentage: totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

      summary.spendingByCategory = categoryTotals;
      summary.incomeVsExpenses = { totalIncome, totalExpenses, net: totalIncome - totalExpenses };
      summary.trends = monthlyData;
    }

    // Process goals
    if (goals && goals.length > 0) {
      goals.forEach(goal => {
        summary.goalProgress[goal.title] = {
          progress: goal.progress?.percentage || 0,
          currentAmount: goal.currentAmount || 0,
          targetAmount: goal.targetAmount || 0,
          daysRemaining: Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24)),
          category: goal.category
        };
      });
    }

    return summary;
  }

  /**
   * Get transaction data formatted for AI analysis
   */
  async getTransactionDataForAI(userId, months = 6) {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      const transactions = await Transaction.aggregate([
        {
          $match: {
            userId: userId,
            date: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              category: '$category.primary',
              month: { $dateToString: { format: '%Y-%m', date: '$date' } }
            },
            totalAmount: { $sum: { $abs: '$amount' } },
            count: { $sum: 1 },
            avgAmount: { $avg: { $abs: '$amount' } },
            transactions: { 
              $push: {
                amount: '$amount',
                description: '$description',
                date: '$date',
                type: '$type',
                merchant: '$merchant.name'
              }
            }
          }
        },
        {
          $sort: { '_id.month': -1, totalAmount: -1 }
        }
      ]);

      return transactions;
    } catch (error) {
      console.error('❌ Error getting transaction data for AI:', error.message);
      return [];
    }
  }

  /**
   * Save visualization created by AI
   */
  async saveVisualization(userId, visualizationData) {
    try {
      const visualization = new Visualization({
        userId: userId,
        title: visualizationData.title || 'AI Generated Chart',
        description: visualizationData.description || 'Generated by AI Financial Advisor',
        chartType: visualizationData.type || 'bar',
        dataConfig: {
          source: 'spending_analysis',
          groupBy: 'category',
          aggregation: 'sum'
        },
        chartData: {
          labels: visualizationData.data?.labels || [],
          datasets: visualizationData.data?.datasets || [],
          lastGenerated: new Date()
        },
        aiContext: {
          prompt: visualizationData.prompt || '',
          model: 'gemini-pro',
          generatedAt: new Date(),
          confidence: 0.85,
          insights: visualizationData.insights || []
        },
        styling: {
          colorScheme: 'categorical',
          showLegend: true,
          showDataLabels: false
        }
      });

      const saved = await visualization.save();
      console.log(`✅ Visualization saved with ID: ${saved._id}`);
      return saved;
    } catch (error) {
      console.error('❌ Error saving visualization:', error.message);
      throw error;
    }
  }

  /**
   * Update user integration insights after new data
   */
  async updateIntegrationInsights(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      // Recalculate integration insights
      user.calculateIntegrationsInsights();
      await user.save();

      console.log(`✅ Integration insights updated for user: ${userId}`);
      return user.integrations.insights;
    } catch (error) {
      console.error('❌ Error updating integration insights:', error.message);
      return null;
    }
  }

  /**
   * Get data for specific chart types
   */
  async getChartData(userId, chartType, dateRange = 6) {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - dateRange);

      switch (chartType) {
        case 'spending_by_category':
          return await this.getSpendingByCategory(userId, startDate);
        case 'income_vs_expenses':
          return await this.getIncomeVsExpenses(userId, startDate);
        case 'goal_progress':
          return await this.getGoalProgress(userId);
        case 'net_worth_trend':
          return await this.getNetWorthTrend(userId, dateRange);
        default:
          return [];
      }
    } catch (error) {
      console.error(`❌ Error getting chart data for ${chartType}:`, error.message);
      return [];
    }
  }

  async getSpendingByCategory(userId, startDate) {
    const result = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: startDate },
          type: { $in: ['expense'] },
          amount: { $lt: 0 }
        }
      },
      {
        $group: {
          _id: '$category.primary',
          total: { $sum: { $abs: '$amount' } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    return result.map(item => ({
      label: this.formatCategoryName(item._id),
      value: item.total,
      count: item.count
    }));
  }

  async getIncomeVsExpenses(userId, startDate) {
    const result = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            month: { $dateToString: { format: '%Y-%m', date: '$date' } },
            type: {
              $cond: [{ $gt: ['$amount', 0] }, 'income', 'expense']
            }
          },
          total: { $sum: { $abs: '$amount' } }
        }
      },
      {
        $sort: { '_id.month': 1 }
      }
    ]);

    // Transform data for chart
    const monthlyData = {};
    result.forEach(item => {
      const month = item._id.month;
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expenses: 0 };
      }
      monthlyData[month][item._id.type === 'income' ? 'income' : 'expenses'] = item.total;
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      label: month,
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses
    }));
  }

  async getGoalProgress(userId) {
    const goals = await Goal.find({
      userId: userId,
      status: 'active'
    }).lean();

    return goals.map(goal => ({
      label: goal.title,
      value: goal.progress?.percentage || 0,
      current: goal.currentAmount || 0,
      target: goal.targetAmount || 0,
      category: goal.category
    }));
  }

  async getNetWorthTrend(userId, months) {
    // This would require historical net worth data
    // For now, return sample trend based on savings vs expenses
    const user = await User.findById(userId).lean();
    const monthlyNet = (user.financialProfile?.monthlyIncome || 0) - (user.financialProfile?.monthlyExpenses || 0);
    
    const trend = [];
    let currentWorth = user.financialProfile?.currentSavings || 0;
    
    for (let i = months; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      currentWorth += monthlyNet;
      
      trend.push({
        label: date.toISOString().substring(0, 7),
        value: Math.max(0, currentWorth)
      });
    }

    return trend;
  }

  formatCategoryName(category) {
    const categoryMap = {
      'food': 'Food & Dining',
      'transportation': 'Transportation',
      'housing': 'Housing',
      'utilities': 'Utilities',
      'healthcare': 'Healthcare',
      'entertainment': 'Entertainment',
      'shopping': 'Shopping',
      'education': 'Education',
      'subscription': 'Subscriptions',
      'other': 'Other'
    };
    return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
  }
}

module.exports = new DatabaseService();