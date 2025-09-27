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
      enum: ['save_money', 'pay_debt', 'invest', 'buy_house', 'retirement', 'emergency_fund', 'save-emergency', 'pay-debt', 'save-purchase', 'invest-retirement', 'invest-wealth', 'budget-control', 'other']
    }],
    riskTolerance: {
      type: String,
      enum: ['low', 'medium', 'high', 'conservative', 'moderate', 'aggressive'],
      default: 'medium'
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

module.exports = mongoose.model('User', userSchema);
