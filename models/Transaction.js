const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Transaction Details
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // Categorization
  category: {
    primary: {
      type: String,
      required: true,
      enum: [
        'income', 'food', 'transportation', 'housing', 'utilities', 
        'healthcare', 'entertainment', 'shopping', 'education', 
        'investment', 'savings', 'debt_payment', 'insurance', 
        'travel', 'subscription', 'charity', 'other'
      ]
    },
    secondary: {
      type: String,
      default: ''
    }
  },
  
  // Transaction Type
  type: {
    type: String,
    enum: ['income', 'expense', 'transfer', 'investment'],
    required: true
  },
  
  // Account Information
  account: {
    name: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      enum: ['checking', 'savings', 'credit', 'investment', 'cash', 'other'],
      default: 'other'
    },
    lastFour: {
      type: String,
      default: ''
    }
  },
  
  // Source Information
  source: {
    type: String,
    enum: ['manual', 'csv_upload', 'bank_api', 'recurring', 'generated'],
    default: 'manual'
  },
  
  // Location/Merchant Info
  merchant: {
    name: {
      type: String,
      default: ''
    },
    location: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      default: ''
    }
  },
  
  // Tags and Notes
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    default: '',
    trim: true
  },
  
  // AI Analysis
  aiAnalysis: {
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral'],
      default: 'neutral'
    },
    categoryConfidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 1
    },
    isRecurring: {
      type: Boolean,
      default: false
    },
    recurringPattern: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'irregular'],
      default: null
    },
    insights: [{
      type: String,
      insight: String,
      confidence: Number
    }]
  },
  
  // Linking to Goals/Bets
  linkedGoal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    default: null
  },
  linkedBet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bet',
    default: null
  },
  
  // Financial Health Metrics
  healthScore: {
    type: Number,
    min: 0,
    max: 10,
    default: 5
  },
  
  // Recurring Transaction Info
  recurring: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'],
      default: null
    },
    nextDate: {
      type: Date,
      default: null
    },
    parentTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      default: null
    }
  },
  
  // Import Metadata
  importMeta: {
    originalId: {
      type: String,
      default: ''
    },
    checkNumber: {
      type: String,
      default: ''
    },
    referenceNumber: {
      type: String,
      default: ''
    },
    importBatch: {
      type: String,
      default: ''
    }
  }
}, {
  timestamps: true
});

// Virtual for absolute amount (always positive)
transactionSchema.virtual('absoluteAmount').get(function() {
  return Math.abs(this.amount);
});

// Virtual for formatted date
transactionSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString();
});

// Method to determine if transaction is beneficial
transactionSchema.methods.isBeneficial = function() {
  const beneficialCategories = ['income', 'investment', 'savings', 'education'];
  return beneficialCategories.includes(this.category.primary) || this.type === 'income';
};

// Method to calculate health impact
transactionSchema.methods.calculateHealthImpact = function(userProfile) {
  let score = 5; // Neutral
  
  // Income is always good
  if (this.type === 'income') {
    score = 9;
  } else if (this.type === 'expense') {
    // Categorize expenses
    const essentials = ['housing', 'utilities', 'food', 'healthcare', 'transportation'];
    const investments = ['investment', 'savings', 'education'];
    const discretionary = ['entertainment', 'shopping', 'travel'];
    const vices = ['subscription']; // Could be refined
    
    if (investments.includes(this.category.primary)) {
      score = 8;
    } else if (essentials.includes(this.category.primary)) {
      // Check if within reasonable limits
      const monthlyIncome = userProfile.financialProfile.monthlyIncome || 0;
      const percentOfIncome = (this.absoluteAmount / monthlyIncome) * 100;
      
      if (percentOfIncome < 5) score = 6;
      else if (percentOfIncome < 15) score = 5;
      else score = 3;
    } else if (discretionary.includes(this.category.primary)) {
      score = 3;
    } else {
      score = 4; // Other/neutral
    }
  }
  
  return score;
};

// Static method to get spending by category for a user
transactionSchema.statics.getSpendingByCategory = function(userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate },
        type: { $in: ['expense'] }
      }
    },
    {
      $group: {
        _id: '$category.primary',
        totalAmount: { $sum: '$absoluteAmount' },
        count: { $sum: 1 },
        averageAmount: { $avg: '$absoluteAmount' }
      }
    },
    {
      $sort: { totalAmount: -1 }
    }
  ]);
};

// Static method to get monthly spending trends
transactionSchema.statics.getMonthlyTrends = function(userId, months = 12) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        date: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type'
        },
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);
};

// Indexes for better query performance
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, 'category.primary': 1 });
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ date: -1 });
transactionSchema.index({ linkedGoal: 1 });
transactionSchema.index({ linkedBet: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
