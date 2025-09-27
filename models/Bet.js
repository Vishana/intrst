const mongoose = require('mongoose');

const betSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Bet Details
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['savings', 'spending_limit', 'investment', 'debt_payment', 'habit_change', 'income_goal', 'custom'],
    required: true
  },
  
  // Financial Stakes
  stakeAmount: {
    type: Number,
    required: true,
    min: 1
  },
  
  // Success Criteria
  targetMetric: {
    type: String,
    required: true,
    trim: true
  },
  targetValue: {
    type: Number,
    required: true
  },
  currentValue: {
    type: Number,
    default: 0
  },
  
  // Timeline
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  
  // Bet Status
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  
  // Payment Information
  payment: {
    stripePaymentIntentId: {
      type: String,
      default: null
    },
    amountPaid: {
      type: Number,
      default: 0
    },
    paymentDate: {
      type: Date,
      default: null
    },
    refundId: {
      type: String,
      default: null
    },
    donationId: {
      type: String,
      default: null
    }
  },
  
  // Charity Selection (for failed bets)
  selectedCharity: {
    name: {
      type: String,
      default: ''
    },
    ein: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      default: ''
    }
  },
  
  // Progress Tracking
  progressUpdates: [{
    value: Number,
    date: {
      type: Date,
      default: Date.now
    },
    note: String,
    source: {
      type: String,
      enum: ['manual', 'automatic', 'transaction_sync'],
      default: 'manual'
    }
  }],
  
  // Evidence/Proof
  evidence: [{
    type: {
      type: String,
      enum: ['screenshot', 'receipt', 'bank_statement', 'photo', 'document', 'other']
    },
    url: String,
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Social Features
  visibility: {
    type: String,
    enum: ['private', 'friends', 'public'],
    default: 'private'
  },
  supporters: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    supportDate: {
      type: Date,
      default: Date.now
    },
    message: String
  }],
  
  // Completion Details
  completionDetails: {
    completedAt: {
      type: Date
    },
    finalValue: {
      type: Number
    },
    successPercentage: {
      type: Number
    },
    outcome: {
      type: String,
      enum: ['success', 'failure', 'partial']
    },
    adminNotes: {
      type: String,
      default: ''
    }
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual for progress percentage
betSchema.virtual('progressPercentage').get(function() {
  if (this.targetValue === 0) return 0;
  return Math.min(100, Math.round((this.currentValue / this.targetValue) * 100));
});

// Virtual for days remaining
betSchema.virtual('daysRemaining').get(function() {
  const today = new Date();
  const endDate = new Date(this.endDate);
  const timeDiff = endDate.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
});

// Virtual for days elapsed
betSchema.virtual('daysElapsed').get(function() {
  const today = new Date();
  const startDate = new Date(this.startDate);
  const timeDiff = today.getTime() - startDate.getTime();
  return Math.floor(timeDiff / (1000 * 3600 * 24));
});

// Method to update progress
betSchema.methods.updateProgress = function(newValue, note = '', source = 'manual') {
  this.progressUpdates.push({
    value: newValue,
    note,
    source,
    date: new Date()
  });
  
  this.currentValue = newValue;
  this.updatedAt = new Date();
  
  // Auto-complete if target reached
  if (newValue >= this.targetValue && this.status === 'active') {
    this.completeBet('success');
  }
  
  return this;
};

// Method to complete bet
betSchema.methods.completeBet = function(outcome) {
  this.status = 'completed';
  this.completionDetails.completedAt = new Date();
  this.completionDetails.finalValue = this.currentValue;
  this.completionDetails.outcome = outcome;
  
  if (this.targetValue > 0) {
    this.completionDetails.successPercentage = Math.round((this.currentValue / this.targetValue) * 100);
  }
  
  return this;
};

// Method to check if bet should be auto-failed (past end date)
betSchema.methods.checkAutoFail = function() {
  const now = new Date();
  const endDate = new Date(this.endDate);
  
  if (now > endDate && this.status === 'active' && this.currentValue < this.targetValue) {
    return this.completeBet('failure');
  }
  
  return this;
};

// Method to get required daily progress
betSchema.methods.getRequiredDailyProgress = function() {
  const remaining = this.targetValue - this.currentValue;
  const daysRemaining = this.daysRemaining;
  
  if (daysRemaining <= 0) return remaining;
  return remaining / daysRemaining;
};

// Method to check if bet is on track
betSchema.methods.isOnTrack = function() {
  const daysRemaining = this.daysRemaining;
  const totalDays = Math.ceil((this.endDate - this.startDate) / (1000 * 3600 * 24));
  const expectedProgress = ((totalDays - daysRemaining) / totalDays) * this.targetValue;
  
  return this.currentValue >= expectedProgress * 0.9; // 90% of expected progress
};

// Indexes for better query performance
betSchema.index({ userId: 1, status: 1 });
betSchema.index({ userId: 1, endDate: 1 });
betSchema.index({ endDate: 1, status: 1 }); // For auto-fail checks

// Update the updatedAt field before saving
betSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Bet', betSchema);
