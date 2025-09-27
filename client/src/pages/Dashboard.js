import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Target,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import FinancialChart from '../components/charts/FinancialChart';
import GoalsSidebar from '../components/goals/GoalsSidebar';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAmounts, setShowAmounts] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/dashboard/overview?range=${timeRange}`);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!showAmounts) return '****';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading your dashboard..." />
      </div>
    );
  }

  const metrics = dashboardData?.metrics || {};
  const insights = dashboardData?.insights || [];
  const recentTransactions = dashboardData?.recentTransactions || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Good {getTimeOfDay()}, {user?.name?.split(' ')[0] || 'there'}! 👋
            </h1>
            <p className="mt-1 text-gray-600">
              Here's your financial overview for {getTimeRangeText(timeRange)}
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="input-field w-32 text-sm"
            >
              <option value="7d">7 days</option>
              <option value="30d">30 days</option>
              <option value="90d">3 months</option>
              <option value="1y">1 year</option>
            </select>
            
            {/* Toggle Amounts */}
            <button
              onClick={() => setShowAmounts(!showAmounts)}
              className="p-2 rounded-lg bg-white shadow-soft hover:shadow-medium transition-shadow"
            >
              {showAmounts ? (
                <EyeOff className="w-4 h-4 text-gray-600" />
              ) : (
                <Eye className="w-4 h-4 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Net Worth"
                value={formatCurrency(metrics.netWorth || 0)}
                change={metrics.netWorthChange || 0}
                icon={DollarSign}
                color="primary"
                showAmounts={showAmounts}
              />
              
              <MetricCard
                title="Monthly Income"
                value={formatCurrency(metrics.monthlyIncome || 0)}
                change={metrics.incomeChange || 0}
                icon={TrendingUp}
                color="success"
                showAmounts={showAmounts}
              />
              
              <MetricCard
                title="Monthly Expenses"
                value={formatCurrency(metrics.monthlyExpenses || 0)}
                change={metrics.expensesChange || 0}
                icon={TrendingDown}
                color="warning"
                showAmounts={showAmounts}
              />
              
              <MetricCard
                title="Savings Rate"
                value={`${metrics.savingsRate || 0}%`}
                change={metrics.savingsRateChange || 0}
                icon={PiggyBank}
                color="success"
                showAmounts={true}
              />
            </div>

            {/* Financial Chart */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">
                  Financial Overview
                </h3>
                <div className="flex space-x-2">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                    Income: {formatCurrency(metrics.monthlyIncome || 0)}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                    Expenses: {formatCurrency(metrics.monthlyExpenses || 0)}
                  </span>
                </div>
              </div>
              
              <FinancialChart 
                data={dashboardData?.chartData}
                timeRange={timeRange}
                showAmounts={showAmounts}
              />
            </div>

            {/* AI Insights */}
            {insights.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">
                    AI Insights 🤖
                  </h3>
                  <span className="text-sm text-gray-500">
                    Powered by your financial advisor
                  </span>
                </div>
                
                <div className="space-y-4">
                  {insights.map((insight, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-sm font-medium">
                              {index + 1}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {insight.title}
                          </p>
                          <p className="text-sm text-gray-700">
                            {insight.description}
                          </p>
                          {insight.action && (
                            <button className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                              {insight.action} →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Transactions */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Transactions
                </h3>
                <button className="btn-secondary text-sm">
                  View All
                </button>
              </div>
              
              {recentTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No transactions yet</p>
                  <button className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Transaction
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTransactions.map((transaction) => (
                    <TransactionRow
                      key={transaction._id}
                      transaction={transaction}
                      showAmounts={showAmounts}
                      formatCurrency={formatCurrency}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Goals Sidebar */}
          <div className="lg:col-span-1">
            <GoalsSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const MetricCard = ({ title, value, change, icon: Icon, color, showAmounts }) => {
  const isPositive = change >= 0;
  
  const colorClasses = {
    primary: 'bg-primary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500'
  };

  return (
    <div className="metric-card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {value}
          </p>
          {change !== 0 && showAmounts && (
            <div className={`flex items-center mt-2 text-sm ${
              isPositive ? 'text-success-600' : 'text-danger-600'
            }`}>
              {isPositive ? (
                <ArrowUpRight className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 mr-1" />
              )}
              {Math.abs(change).toFixed(1)}% from last period
            </div>
          )}
        </div>
        
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

const TransactionRow = ({ transaction, showAmounts, formatCurrency }) => {
  const isExpense = transaction.type === 'expense';
  
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isExpense ? 'bg-red-100' : 'bg-green-100'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isExpense ? 'bg-red-500' : 'bg-green-500'
          }`} />
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-900">
            {transaction.description}
          </p>
          <p className="text-xs text-gray-500">
            {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <div className={`text-sm font-medium ${
        isExpense ? 'text-red-600' : 'text-green-600'
      }`}>
        {isExpense ? '-' : '+'}
        {formatCurrency(transaction.amount)}
      </div>
    </div>
  );
};

// Helper functions
const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
};

const getTimeRangeText = (range) => {
  const ranges = {
    '7d': 'the past week',
    '30d': 'the past month',
    '90d': 'the past 3 months',
    '1y': 'the past year'
  };
  return ranges[range] || 'the selected period';
};

export default Dashboard;
