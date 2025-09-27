const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Authentication
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  // Profile Information
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Onboarding Information
  onboarding: {
    isComplete: {
      type: Boolean,
      default: false
    },
    lifeStage: {
      type: String,
      default: null
    },
    age: {
      type: String,
      default: null
    },
    income: {
      type: Number,
      default: null
    },
    primaryGoals: [{
      type: String,
      enum: [
        'save-emergency', 
        'pay-debt', 
        'save-purchase', 
        'invest-retirement', 
        'invest-wealth', 
        'budget-control',
        'other'
      ]}],
    riskTolerance: {
      type: String,
      enum: ['conservative', 'moderate', 'aggressive'],
      default: 'moderate'
    },
    investmentExperience: {
      type: String,
      enum: ['beginner', 'some', 'experienced', 'expert'],
      default: undefined,
      required: false
    },
    investmentTimeline: {
      type: String,
      enum: ['short', 'medium', 'long', 'retirement'],
      default: undefined,
      required: false
    },
    communicationMethod: {
      type: String,
      enum: ['email', 'sms', 'push', 'minimal'],
      default: 'email'
    },
    customGoals: [{
      description: String,
      targetAmount: Number,
      targetDate: Date,
      category: String
    }]
  },
  
  // Financial Data
  financialProfile: {
    currentSavings: {
      type: Number,
      default: 0
    },
    monthlyIncome: {
      type: Number,
      default: 0
    },
    monthlyExpenses: {
      type: Number,
      default: 0
    },
    debt: {
      type: Number,
      default: 0
    },
    creditScore: {
      type: Number,
      min: 300,
      max: 850,
      default: null
    }
  },
  
  // Preferences
  preferences: {
    currency: {
      type: String,
      default: 'USD'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      goals: {
        type: Boolean,
        default: true
      },
      bets: {
        type: Boolean,
        default: true
      },
      advisor: {
        type: Boolean,
        default: true
      }
    },
    dashboard: {
      defaultView: {
        type: String,
        enum: ['overview', 'goals', 'spending', 'investments'],
        default: 'overview'
      }
    }
  },
  
  // Activity Tracking
  lastLogin: {
    type: Date,
    default: Date.now
  },
  
  // Financial Integrations Data
  integrations: {
    connected: [{
      provider: {
        type: String,
        enum: ['fidelity', 'vanguard', 'schwab', 'paypal', 'venmo', 'mint', 'personalCapital', 'robinhood'],
        required: true
      },
      type: {
        type: String,
        enum: ['retirement', 'investment', 'brokerage', 'spending', 'budget', 'wealth', 'trading'],
        required: true
      },
      connectedAt: {
        type: Date,
        default: Date.now
      },
      lastSync: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ['active', 'inactive', 'error'],
        default: 'active'
      }
    }],
    
    data: {
      // Retirement accounts (Fidelity, etc.)
      retirement: [{
        accountType: String,
        accountNumber: String,
        balance: Number,
        ytdContributions: Number,
        employerMatch: Number,
        assetAllocation: String,
        provider: String,
        lastUpdated: Date,
        raw: mongoose.Schema.Types.Mixed
      }],
      
      // Investment accounts (Vanguard, etc.)
      investment: [{
        fundName: String,
        symbol: String,
        shares: Number,
        price: Number,
        marketValue: Number,
        gainLoss: Number,
        gainLossPercent: Number,
        assetClass: String,
        provider: String,
        lastUpdated: Date,
        raw: mongoose.Schema.Types.Mixed
      }],
      
      // Brokerage accounts (Schwab, etc.)
      brokerage: [{
        date: Date,
        action: String,
        symbol: String,
        description: String,
        quantity: Number,
        price: Number,
        amount: Number,
        account: String,
        provider: String,
        lastUpdated: Date,
        raw: mongoose.Schema.Types.Mixed
      }],
      
      // Spending data (PayPal, Venmo, etc.)
      spending: [{
        date: Date,
        description: String,
        category: String,
        amount: Number,
        type: String,
        status: String,
        merchant: String,
        provider: String,
        lastUpdated: Date,
        raw: mongoose.Schema.Types.Mixed
      }],
      
      // Budget data (Mint, etc.)
      budget: [{
        category: String,
        budgetedAmount: Number,
        spentAmount: Number,
        remaining: Number,
        percentageUsed: Number,
        goal: String,
        status: String,
        provider: String,
        lastUpdated: Date,
        raw: mongoose.Schema.Types.Mixed
      }],
      
      // Wealth tracking (Personal Capital, etc.)
      wealth: [{
        accountType: String,
        institution: String,
        accountName: String,
        balance: Number,
        change1Month: Number,
        change3Month: Number,
        assetClass: String,
        allocationPercent: Number,
        provider: String,
        lastUpdated: Date,
        raw: mongoose.Schema.Types.Mixed
      }],
      
      // Trading data (Robinhood, etc.)
      trading: [{
        date: Date,
        instrument: String,
        side: String,
        quantity: Number,
        price: Number,
        totalAmount: Number,
        fees: Number,
        state: String,
        settlementDate: Date,
        provider: String,
        lastUpdated: Date,
        raw: mongoose.Schema.Types.Mixed
      }]
    },
    
    // Aggregated insights for AI advisor
    insights: {
      totalNetWorth: {
        type: Number,
        default: 0
      },
      totalInvestments: {
        type: Number,
        default: 0
      },
      totalDebt: {
        type: Number,
        default: 0
      },
      monthlySpending: {
        type: Number,
        default: 0
      },
      monthlyIncome: {
        type: Number,
        default: 0
      },
      spendingByCategory: [{
        category: String,
        amount: Number,
        percentage: Number
      }],
      investmentAllocation: [{
        assetClass: String,
        amount: Number,
        percentage: Number
      }],
      lastCalculated: {
        type: Date,
        default: Date.now
      }
    }
  },

  // Gamification Stats
  gamification: {
    level: {
      type: Number,
      default: 1
    },
    points: {
      type: Number,
      default: 0
    },
    streak: {
      current: {
        type: Number,
        default: 0
      },
      best: {
        type: Number,
        default: 0
      },
      lastActivity: {
        type: Date,
        default: Date.now
      }
    },
    achievements: [{
      name: String,
      description: String,
      earnedAt: Date,
      icon: String
    }],
    
    // Betting-specific stats
    successfulBets: {
      type: Number,
      default: 0
    },
    failedBets: {
      type: Number,
      default: 0
    },
    totalWinnings: {
      type: Number,
      default: 0
    },
    totalDonated: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    recentAchievements: [{
      title: String,
      description: String,
      points: Number,
      earnedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to get user's display name
userSchema.methods.getDisplayName = function() {
  return `${this.firstName} ${this.lastName}`;
};

// Method to calculate net worth
userSchema.methods.calculateNetWorth = function() {
  return this.financialProfile.currentSavings - this.financialProfile.debt;
};

// Method to update streak
userSchema.methods.updateStreak = function() {
  const now = new Date();
  const lastActivity = this.gamification.streak.lastActivity;
  const daysSinceLastActivity = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
  
  if (daysSinceLastActivity === 1) {
    // Continue streak
    this.gamification.streak.current += 1;
    if (this.gamification.streak.current > this.gamification.streak.best) {
      this.gamification.streak.best = this.gamification.streak.current;
    }
  } else if (daysSinceLastActivity > 1) {
    // Break streak
    this.gamification.streak.current = 1;
  }
  // If same day, don't change streak
  
  this.gamification.streak.lastActivity = now;
};

// Method to add integration data
userSchema.methods.addIntegrationData = function(provider, type, data) {
  // Add to connected integrations if not already present
  const existingConnection = this.integrations.connected.find(
    conn => conn.provider === provider && conn.type === type
  );
  
  if (!existingConnection) {
    this.integrations.connected.push({
      provider,
      type,
      connectedAt: new Date(),
      lastSync: new Date(),
      status: 'active'
    });
  } else {
    existingConnection.lastSync = new Date();
    existingConnection.status = 'active';
  }
  
  // Clear existing data for this provider/type and add new data
  this.integrations.data[type] = this.integrations.data[type] || [];
  this.integrations.data[type] = this.integrations.data[type].filter(
    item => item.provider !== provider
  );
  
  // Add new data with provider and timestamp
  const timestampedData = data.map(item => ({
    ...item,
    provider,
    lastUpdated: new Date()
  }));
  
  this.integrations.data[type].push(...timestampedData);
  
  // Recalculate insights
  this.calculateIntegrationsInsights();
};

// Method to calculate integration insights for AI advisor
userSchema.methods.calculateIntegrationsInsights = function() {
  const insights = {
    totalNetWorth: 0,
    totalInvestments: 0,
    totalDebt: 0,
    monthlySpending: 0,
    monthlyIncome: 0,
    spendingByCategory: [],
    investmentAllocation: [],
    lastCalculated: new Date()
  };
  
  // Calculate from retirement accounts
  if (this.integrations.data.retirement) {
    this.integrations.data.retirement.forEach(account => {
      insights.totalNetWorth += account.balance || 0;
      insights.totalInvestments += account.balance || 0;
    });
  }
  
  // Calculate from investment accounts
  if (this.integrations.data.investment) {
    this.integrations.data.investment.forEach(investment => {
      insights.totalInvestments += investment.marketValue || 0;
      insights.totalNetWorth += investment.marketValue || 0;
    });
  }
  
  // Calculate from wealth accounts
  if (this.integrations.data.wealth) {
    this.integrations.data.wealth.forEach(account => {
      insights.totalNetWorth += account.balance || 0;
      if (account.assetClass !== 'Cash') {
        insights.totalInvestments += account.balance || 0;
      }
    });
  }
  
  // Calculate spending patterns
  if (this.integrations.data.spending) {
    const categorySpending = {};
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    this.integrations.data.spending.forEach(transaction => {
      if (transaction.date >= thirtyDaysAgo) {
        const amount = Math.abs(transaction.amount);
        if (transaction.amount < 0) { // Expense
          categorySpending[transaction.category] = (categorySpending[transaction.category] || 0) + amount;
          insights.monthlySpending += amount;
        } else { // Income
          insights.monthlyIncome += amount;
        }
      }
    });
    
    // Convert to array with percentages
    const totalSpending = insights.monthlySpending;
    insights.spendingByCategory = Object.entries(categorySpending).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalSpending > 0 ? (amount / totalSpending) * 100 : 0
    }));
  }
  
  // Calculate investment allocation
  if (this.integrations.data.investment) {
    const allocationMap = {};
    let totalInvestmentValue = 0;
    
    this.integrations.data.investment.forEach(investment => {
      const assetClass = investment.assetClass || 'Unknown';
      const value = investment.marketValue || 0;
      allocationMap[assetClass] = (allocationMap[assetClass] || 0) + value;
      totalInvestmentValue += value;
    });
    
    insights.investmentAllocation = Object.entries(allocationMap).map(([assetClass, amount]) => ({
      assetClass,
      amount,
      percentage: totalInvestmentValue > 0 ? (amount / totalInvestmentValue) * 100 : 0
    }));
  }
  
  this.integrations.insights = insights;
};

// Method to get integration summary for AI advisor
userSchema.methods.getFinancialSummary = function() {
  return {
    netWorth: this.integrations.insights.totalNetWorth || 0,
    totalInvestments: this.integrations.insights.totalInvestments || 0,
    monthlyIncome: this.integrations.insights.monthlyIncome || 0,
    monthlySpending: this.integrations.insights.monthlySpending || 0,
    savingsRate: this.integrations.insights.monthlyIncome > 0 ? 
      ((this.integrations.insights.monthlyIncome - this.integrations.insights.monthlySpending) / this.integrations.insights.monthlyIncome) * 100 : 0,
    spendingByCategory: this.integrations.insights.spendingByCategory || [],
    investmentAllocation: this.integrations.insights.investmentAllocation || [],
    connectedAccounts: this.integrations.connected.length || 0,
    lastDataSync: this.integrations.connected.reduce((latest, conn) => {
      return conn.lastSync > latest ? conn.lastSync : latest;
    }, new Date(0))
  };
};

module.exports = mongoose.model('User', userSchema);
