const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Goal Details
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['savings', 'debt_payoff', 'investment', 'spending_reduction', 'income_increase', 'emergency_fund', 'custom'],
    required: true
  },
  
  // Target Information
  targetAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  targetDate: {
    type: Date,
    required: true
  },
  
  // Progress Tracking
  progress: {
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    milestones: [{
      amount: Number,
      date: Date,
      description: String,
      achieved: {
        type: Boolean,
        default: false
      }
    }]
  },
  
  // Goal Status
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active'
  },
  
  // Automation Settings
  automation: {
    isAutomatic: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'biweekly', 'monthly'],
      default: 'monthly'
    },
    amount: {
      type: Number,
      default: 0
    },
    nextContribution: {
      type: Date,
      default: null
    }
  },
  
  // Tracking Data
  contributions: [{
    amount: Number,
    date: {
      type: Date,
      default: Date.now
    },
    source: {
      type: String,
      enum: ['manual', 'automatic', 'bet_win', 'bonus'],
      default: 'manual'
    },
    description: String
  }],
  
  // Gamification
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Virtual for progress percentage calculation
goalSchema.virtual('calculatedProgress').get(function() {
  if (this.targetAmount === 0) return 0;
  return Math.min(100, Math.round((this.currentAmount / this.targetAmount) * 100));
});

// Method to add contribution
goalSchema.methods.addContribution = function(amount, source = 'manual', description = '') {
  this.contributions.push({
    amount,
    source,
    description,
    date: new Date()
  });
  
  this.currentAmount += amount;
  this.progress.percentage = this.calculatedProgress;
  this.updatedAt = new Date();
  
  // Check if goal is completed
  if (this.currentAmount >= this.targetAmount) {
    this.status = 'completed';
    this.completedAt = new Date();
  }
  
  return this;
};

// Method to get days remaining
goalSchema.methods.getDaysRemaining = function() {
  const today = new Date();
  const targetDate = new Date(this.targetDate);
  const timeDiff = targetDate.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

// Method to get required daily savings
goalSchema.methods.getRequiredDailySavings = function() {
  const remaining = this.targetAmount - this.currentAmount;
  const daysRemaining = this.getDaysRemaining();
  
  if (daysRemaining <= 0) return remaining;
  return remaining / daysRemaining;
};

// Method to check if goal is on track
goalSchema.methods.isOnTrack = function() {
  const daysRemaining = this.getDaysRemaining();
  const totalDays = Math.ceil((this.targetDate - this.createdAt) / (1000 * 3600 * 24));
  const expectedProgress = ((totalDays - daysRemaining) / totalDays) * 100;
  
  return this.progress.percentage >= expectedProgress * 0.9; // 90% of expected progress
};

// Update progress percentage before saving
goalSchema.pre('save', function(next) {
  if (this.targetAmount > 0) {
    this.progress.percentage = this.calculatedProgress;
  }
  next();
});

// Indexes for better query performance
goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ userId: 1, category: 1 });
goalSchema.index({ targetDate: 1 });

module.exports = mongoose.model('Goal', goalSchema);
