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
   * ✅ ENHANCED: Get comprehensive user financial data for AI analysis - PRIORITIZING INTEGRATIONS
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
      
      // Process spending data if available
      if (user.integrations?.data?.spending && user.integrations.data.spending.length > 0) {
        console.log(`💳 Processing ${user.integrations.data.spending.length} integration spending records`);
        const spendingTransactions = this.processIntegrationsSpending(user.integrations.data.spending);
        integrationsTransactions = [...integrationsTransactions, ...spendingTransactions];
      }
      
      // Process investment data if available
      if (user.integrations?.data?.investment && user.integrations.data.investment.length > 0) {
        console.log(`📈 Processing ${user.integrations.data.investment.length} integration investment records`);
        const investmentTransactions = this.processIntegrationsInvestments(user.integrations.data.investment);
        integrationsTransactions = [...integrationsTransactions, ...investmentTransactions];
      }
      
      // Process retirement data if available  
      if (user.integrations?.data?.retirement && user.integrations.data.retirement.length > 0) {
        console.log(`🏦 Processing ${user.integrations.data.retirement.length} integration retirement records`);
        const retirementTransactions = this.processIntegrationsRetirement(user.integrations.data.retirement);
        integrationsTransactions = [...integrationsTransactions, ...retirementTransactions];
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
   * ✅ NEW: Process integrations investment data into transaction format
   */
  processIntegrationsInvestments(investmentData) {
    console.log('📈 Processing integrations investment data...');
    
    return investmentData.map(investment => ({
      _id: `investment_${investment._id || Date.now()}_${Math.random()}`,
      userId: null, // Will be set by caller
      amount: investment.marketValue || investment.value || investment.amount || 0,
      description: `${investment.fundName || investment.symbol || investment.name || 'Investment'} Holdings`,
      date: new Date(investment.lastUpdated || investment.date || Date.now()),
      category: {
        primary: this.mapInvestmentCategory(investment.assetClass || investment.assetType)
      },
      type: 'investment',
      source: 'integration',
      investment: {
        symbol: investment.symbol,
        fundName: investment.fundName,
        shares: investment.shares,
        price: investment.price,
        marketValue: investment.marketValue,
        gainLoss: investment.gainLoss,
        gainLossPercent: investment.gainLossPercent,
        assetClass: investment.assetClass,
        provider: investment.provider,
        costBasis: investment.costBasis || (investment.shares * investment.price - investment.gainLoss)
      },
      integration: {
        provider: investment.provider || 'Investment Account',
        originalData: investment
      }
    }));
  }

  /**
   * ✅ NEW: Process integrations retirement data into transaction format
   */
  processIntegrationsRetirement(retirementData) {
    console.log('🏦 Processing integrations retirement data...');
    
    return retirementData.map(retirement => ({
      _id: `retirement_${retirement._id || Date.now()}_${Math.random()}`,
      userId: null, // Will be set by caller
      amount: retirement.balance || retirement.value || retirement.amount || 0,
      description: `${retirement.accountType || 'Retirement Account'} - ${retirement.provider || 'Provider'} Balance`,
      date: new Date(retirement.date || retirement.lastUpdated || Date.now()),
      category: {
        primary: 'retirement'
      },
      type: 'retirement',
      source: 'integration',
      retirement: {
        accountType: retirement.accountType,
        provider: retirement.provider,
        balance: retirement.balance || retirement.value,
        contributions: retirement.contributions,
        employerMatch: retirement.employerMatch
      },
      integration: {
        provider: retirement.provider || 'Retirement Account',
        originalData: retirement
      }
    }));
  }

  /**
   * ✅ NEW: Map investment categories to our standard categories
   */
  mapInvestmentCategory(assetType) {
    if (!assetType) return 'investment';
    
    const categoryMap = {
      'Stock': 'stocks',
      'Equity': 'stocks', 
      'Bond': 'bonds',
      'Fixed Income': 'bonds',
      'Real Estate': 'real-estate',
      'REITs': 'real-estate',
      'International Stock': 'international-stocks',
      'Emerging Markets': 'emerging-markets',
      'Cash': 'cash',
      'Money Market': 'cash',
      'Mutual Fund': 'mutual-funds',
      'ETF': 'etf',
      'Index Fund': 'index-funds',
      'Cryptocurrency': 'crypto',
      'Commodities': 'commodities'
    };

    const lowerAssetType = assetType.toLowerCase();
    for (const [key, value] of Object.entries(categoryMap)) {
      if (lowerAssetType.includes(key.toLowerCase())) {
        return value;
      }
    }
    
    return 'investment';
  }
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

  /**
   * Calculate financial summary metrics - LEGACY METHOD
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
        const month = transaction.date.toISOString().substring(0, 7);

        if (!categoryTotals[category]) {
          categoryTotals[category] = { total: 0, count: 0, transactions: [] };
        }
        categoryTotals[category].total += amount;
        categoryTotals[category].count += 1;
        categoryTotals[category].transactions.push(transaction);

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
   * Save AI-generated visualization
   */
  async saveVisualization(userId, visualizationData) {
    try {
      const visualization = new Visualization({
        userId: userId,
        title: visualizationData.title,
        type: visualizationData.type,
        data: visualizationData.data,
        config: visualizationData.config,
        insights: visualizationData.insights,
        savedToSidebar: visualizationData.savedToSidebar || false,
        lastViewed: new Date()
      });

      await visualization.save();
      console.log(`✅ Visualization saved: ${visualization.title}`);
      return visualization;
    } catch (error) {
      console.error('❌ Error saving visualization:', error.message);
      throw error;
    }
  }

  /**
   * Update user integration insights from connected accounts
   */
  async updateIntegrationInsights(userId) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.integrations || !user.integrations.data) {
        return null;
      }

      // Calculate insights from integration data
      const insights = this.calculateIntegrationInsights(user.integrations.data);
      
      // Update user with new insights
      user.integrations.insights = insights;
      await user.save();

      console.log(`✅ Integration insights updated for user ${userId}`);
      return insights;
    } catch (error) {
      console.error('❌ Error updating integration insights:', error.message);
      throw error;
    }
  }

  /**
   * Get chart data based on type and date range
   */
  async getChartData(userId, chartType, dateRange = 6) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - dateRange);

    let chartData = {};

    switch (chartType) {
      case 'spending-by-category':
        chartData = await this.getSpendingByCategory(userId, startDate);
        break;
      case 'income-vs-expenses':
        chartData = await this.getIncomeVsExpenses(userId, startDate);
        break;
      case 'goal-progress':
        chartData = await this.getGoalProgress(userId);
        break;
      case 'net-worth-trend':
        chartData = await this.getNetWorthTrend(userId, dateRange);
        break;
      default:
        throw new Error(`Unsupported chart type: ${chartType}`);
    }

    console.log(`✅ Retrieved chart data for ${userId}: ${chartData.datasets?.length || 0} datasets`);
    return chartData;
  }

  async getSpendingByCategory(userId, startDate) {
    const transactions = await Transaction.find({
      userId: userId,
      date: { $gte: startDate },
      amount: { $lt: 0 }
    });

    const categoryData = {};
    transactions.forEach(transaction => {
      const category = transaction.category?.primary || 'other';
      categoryData[category] = (categoryData[category] || 0) + Math.abs(transaction.amount);
    });

    return {
      type: 'pie',
      datasets: [{
        data: Object.values(categoryData),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
          '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
        ]
      }],
      labels: Object.keys(categoryData)
    };
  }

  async getIncomeVsExpenses(userId, startDate) {
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
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: {
              $cond: [{ $gt: ['$amount', 0] }, 'income', 'expenses']
            }
          },
          total: { $sum: { $abs: '$amount' } }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const monthlyData = {};
    transactions.forEach(item => {
      const monthKey = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0 };
      }
      monthlyData[monthKey][item._id.type] = item.total;
    });

    return {
      type: 'bar',
      datasets: [
        {
          label: 'Income',
          data: Object.values(monthlyData).map(d => d.income),
          backgroundColor: '#4CAF50'
        },
        {
          label: 'Expenses',
          data: Object.values(monthlyData).map(d => d.expenses),
          backgroundColor: '#F44336'
        }
      ],
      labels: Object.keys(monthlyData)
    };
  }

  async getGoalProgress(userId) {
    const goals = await Goal.find({ userId: userId, status: 'active' });

    return {
      type: 'doughnut',
      datasets: [{
        data: goals.map(goal => goal.progress?.percentage || 0),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
      }],
      labels: goals.map(goal => goal.title)
    };
  }

  async getNetWorthTrend(userId, months) {
    // This would typically pull from historical snapshots
    // For now, return mock data structure
    return {
      type: 'line',
      datasets: [{
        label: 'Net Worth',
        data: [10000, 12000, 11500, 13000, 14500, 15000],
        borderColor: '#36A2EB',
        fill: false
      }],
      labels: ['6 months ago', '5 months ago', '4 months ago', '3 months ago', '2 months ago', 'Last month']
    };
  }
}

module.exports = new DatabaseService();