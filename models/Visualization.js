const mongoose = require('mongoose');

const visualizationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Visualization Details
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Chart Configuration
  chartType: {
    type: String,
    required: true,
    enum: [
      'line', 'bar', 'pie', 'doughnut', 'area', 'scatter', 
      'bubble', 'radar', 'gauge', 'treemap', 'heatmap', 'funnel'
    ]
  },
  
  // Data Configuration
  dataConfig: {
    source: {
      type: String,
      required: true,
      enum: ['transactions', 'goals', 'bets', 'net_worth', 'spending_analysis', 'custom']
    },
    filters: {
      dateRange: {
        start: Date,
        end: Date
      },
      categories: [String],
      accounts: [String],
      transactionTypes: [String],
      amountRange: {
        min: Number,
        max: Number
      }
    },
    groupBy: {
      type: String,
      enum: ['day', 'week', 'month', 'quarter', 'year', 'category', 'account', 'merchant']
    },
    aggregation: {
      type: String,
      enum: ['sum', 'average', 'count', 'min', 'max'],
      default: 'sum'
    }
  },
  
  // Chart Styling
  styling: {
    colorScheme: {
      type: String,
      enum: ['default', 'monochrome', 'gradient', 'categorical', 'diverging', 'custom'],
      default: 'default'
    },
    colors: [String], // Hex color codes
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    showLegend: {
      type: Boolean,
      default: true
    },
    showDataLabels: {
      type: Boolean,
      default: false
    },
    showGrid: {
      type: Boolean,
      default: true
    }
  },
  
  // Generated Chart Data (cached)
  chartData: {
    labels: [String],
    datasets: [{
      label: String,
      data: [mongoose.Schema.Types.Mixed],
      backgroundColor: [String],
      borderColor: [String],
      borderWidth: Number
    }],
    lastGenerated: {
      type: Date,
      default: Date.now
    }
  },
  
  // AI Generation Context
  aiContext: {
    prompt: {
      type: String,
      default: ''
    },
    model: {
      type: String,
      enum: ['gpt-4', 'gpt-3.5-turbo', 'claude-3', 'gemini-pro'],
      default: 'gpt-4'
    },
    generatedAt: {
      type: Date,
      default: Date.now
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.8
    },
    insights: [{
      insight: String,
      confidence: Number,
      category: {
        type: String,
        enum: ['trend', 'anomaly', 'opportunity', 'warning', 'achievement']
      }
    }]
  },
  
  // User Interaction
  savedToSidebar: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  },
  lastViewed: {
    type: Date,
    default: Date.now
  },
  
  // Sharing Settings
  sharing: {
    isPublic: {
      type: Boolean,
      default: false
    },
    sharedWith: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      permissions: {
        type: String,
        enum: ['view', 'edit'],
        default: 'view'
      },
      sharedAt: {
        type: Date,
        default: Date.now
      }
    }],
    publicUrl: {
      type: String,
      default: ''
    }
  },
  
  // Performance Tracking
  performance: {
    generationTime: {
      type: Number, // milliseconds
      default: 0
    },
    dataPoints: {
      type: Number,
      default: 0
    },
    complexity: {
      type: String,
      enum: ['simple', 'medium', 'complex'],
      default: 'simple'
    }
  }
}, {
  timestamps: true
});

// Virtual for age of visualization
visualizationSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  return Math.floor((now - created) / (1000 * 60 * 60 * 24));
});

// Method to check if data needs refresh
visualizationSchema.methods.needsRefresh = function() {
  if (!this.chartData.lastGenerated) return true;
  
  const now = new Date();
  const lastGenerated = new Date(this.chartData.lastGenerated);
  const hoursSinceGeneration = (now - lastGenerated) / (1000 * 60 * 60);
  
  // Refresh based on data source
  switch (this.dataConfig.source) {
    case 'transactions':
      return hoursSinceGeneration > 24; // Daily refresh for transactions
    case 'goals':
    case 'bets':
      return hoursSinceGeneration > 12; // Twice daily for goals/bets
    case 'net_worth':
      return hoursSinceGeneration > 168; // Weekly for net worth
    default:
      return hoursSinceGeneration > 24;
  }
};

// Method to increment view count
visualizationSchema.methods.recordView = function() {
  this.viewCount += 1;
  this.lastViewed = new Date();
  return this.save();
};

// Method to generate chart configuration for frontend
visualizationSchema.methods.getChartConfig = function() {
  return {
    type: this.chartType,
    data: this.chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: this.styling.showLegend
        },
        title: {
          display: true,
          text: this.title
        }
      },
      scales: this.chartType === 'pie' || this.chartType === 'doughnut' ? {} : {
        y: {
          beginAtZero: true,
          grid: {
            display: this.styling.showGrid
          }
        },
        x: {
          grid: {
            display: this.styling.showGrid
          }
        }
      }
    }
  };
};

// Static method to get popular chart types
visualizationSchema.statics.getPopularChartTypes = function(userId) {
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId)
      }
    },
    {
      $group: {
        _id: '$chartType',
        count: { $sum: 1 },
        totalViews: { $sum: '$viewCount' },
        avgViews: { $avg: '$viewCount' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Static method to get user's saved visualizations
visualizationSchema.statics.getSavedVisualizations = function(userId) {
  return this.find({
    userId: mongoose.Types.ObjectId(userId),
    savedToSidebar: true
  }).sort({ isPinned: -1, lastViewed: -1 });
};

// Indexes for better query performance
visualizationSchema.index({ userId: 1, savedToSidebar: 1 });
visualizationSchema.index({ userId: 1, chartType: 1 });
visualizationSchema.index({ 'aiContext.generatedAt': -1 });
visualizationSchema.index({ lastViewed: -1 });

module.exports = mongoose.model('Visualization', visualizationSchema);
