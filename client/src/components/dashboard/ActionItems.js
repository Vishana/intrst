import React from 'react';
import { TrendingUp, AlertTriangle, Target, DollarSign, PiggyBank, CreditCard } from 'lucide-react';

const ActionItems = ({ selectedView, userData, allDataInsights }) => {
  const getContextualActionItems = (view) => {
    const actionItems = {
      general: [
        {
          icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
          title: "Emergency Fund Gap",
          description: "You're $2,500 short of your 6-month emergency fund goal",
          priority: "high",
          action: "Set up automatic transfer of $200/month"
        },
        {
          icon: <TrendingUp className="w-5 h-5 text-green-600" />,
          title: "Investment Growth",
          description: "Your portfolio gained 8.2% this quarter",
          priority: "positive",
          action: "Consider rebalancing if over-concentrated"
        },
        {
          icon: <Target className="w-5 h-5 text-blue-600" />,
          title: "Retirement On Track",
          description: "Contributing 12% to retirement - ahead of schedule",
          priority: "positive",
          action: "Maintain current contribution level"
        }
      ],
      'net worth': [
        {
          icon: <TrendingUp className="w-5 h-5 text-green-600" />,
          title: "Positive Growth Trend",
          description: "Net worth increased by $2,400 this quarter",
          priority: "positive",
          action: "Continue current savings and investment strategy"
        },
        {
          icon: <CreditCard className="w-5 h-5 text-red-600" />,
          title: "High-Interest Debt",
          description: "Credit card balance charging 24.9% APR",
          priority: "high",
          action: "Pay off $3,200 credit card debt immediately"
        },
        {
          icon: <PiggyBank className="w-5 h-5 text-blue-600" />,
          title: "Investment Allocation",
          description: "70% stocks may be too aggressive for your age",
          priority: "medium",
          action: "Consider shifting 10% to bonds for stability"
        }
      ],
      investment: [
        {
          icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
          title: "Portfolio Concentration",
          description: "35% of portfolio in tech stocks - consider diversifying",
          priority: "medium",
          action: "Rebalance to reduce tech exposure to 25%"
        },
        {
          icon: <TrendingUp className="w-5 h-5 text-green-600" />,
          title: "International Exposure Low",
          description: "Only 8% international allocation vs recommended 20-30%",
          priority: "low",
          action: "Gradually increase international fund allocation"
        },
        {
          icon: <DollarSign className="w-5 h-5 text-blue-600" />,
          title: "Tax-Loss Harvesting",
          description: "Opportunity to harvest $1,200 in tax losses",
          priority: "medium",
          action: "Sell underperforming positions before year-end"
        }
      ],
      spending: [
        {
          icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
          title: "Food Spending Spike",
          description: "Dining out increased 28% vs last month",
          priority: "high",
          action: "Set weekly dining budget of $80"
        },
        {
          icon: <TrendingUp className="w-5 h-5 text-green-600" />,
          title: "Transportation Savings",
          description: "Saved $120 on gas by using public transit",
          priority: "positive",
          action: "Continue using public transit 3 days/week"
        },
        {
          icon: <Target className="w-5 h-5 text-blue-600" />,
          title: "Subscription Audit",
          description: "3 unused subscriptions costing $47/month",
          priority: "medium",
          action: "Cancel Netflix, Hulu, and Spotify premium"
        }
      ]
    };

    return actionItems[view] || actionItems.general;
  };

  const getGlobalActionItems = () => {
    return [
      {
        icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
        title: "Debt Payoff Priority",
        description: "High-interest debt costing $65/month in interest",
        priority: "critical",
        action: "Focus all extra funds on credit card debt",
        impact: "Save $780/year in interest"
      },
      {
        icon: <PiggyBank className="w-5 h-5 text-blue-600" />,
        title: "Tax Optimization",
        description: "Not maximizing tax-advantaged accounts",
        priority: "high",
        action: "Increase 401k contribution to get full employer match",
        impact: "Additional $1,500 in free money"
      },
      {
        icon: <TrendingUp className="w-5 h-5 text-green-600" />,
        title: "Investment Rebalancing",
        description: "Portfolio allocation has drifted from target",
        priority: "medium",
        action: "Rebalance quarterly to maintain 70/30 stock/bond ratio",
        impact: "Optimize risk-adjusted returns"
      },
      {
        icon: <Target className="w-5 h-5 text-yellow-600" />,
        title: "Goal Tracking",
        description: "3 financial goals are behind schedule",
        priority: "medium",
        action: "Increase monthly savings by $150 to stay on track",
        impact: "Meet all goals by target dates"
      }
    ];
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'border-red-500 bg-red-50';
      case 'high':
        return 'border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-blue-500 bg-blue-50';
      case 'positive':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const contextualItems = getContextualActionItems(selectedView);
  const globalItems = getGlobalActionItems();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Contextual Action Items */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Action Items for Current View
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Specific recommendations based on your {selectedView} data:
        </p>
        
        <div className="space-y-4">
          {contextualItems.map((item, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-lg border-l-4 ${getPriorityColor(item.priority)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900">
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {item.description}
                  </p>
                  <div className="mt-2">
                    <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      {item.action}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Global Action Items */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Overall Financial Actions
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          High-impact recommendations from your complete financial picture:
        </p>
        
        <div className="space-y-4">
          {globalItems.map((item, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-lg border-l-4 ${getPriorityColor(item.priority)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900">
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {item.description}
                  </p>
                  <div className="mt-2 space-y-1">
                    <div>
                      <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        {item.action}
                      </span>
                    </div>
                    {item.impact && (
                      <div>
                        <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                          💡 {item.impact}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActionItems;