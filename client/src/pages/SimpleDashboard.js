import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Target,
  Eye,
  EyeOff,
  BarChart3,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  LayoutDashboard, 
  MessageCircle, 
  LinkIcon,
  User, 
  LogOut
} from 'lucide-react';
import axios from 'axios';

const SimpleDashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAmounts, setShowAmounts] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedView, setSelectedView] = useState('general');

  const viewOptions = [
    { id: 'general', label: 'General', description: 'Overall financial overview' },
    { id: 'net worth', label: 'Net Worth', description: 'Assets, liabilities, and trends' },
    { id: 'investment', label: 'Investment', description: 'Portfolio allocation and performance' },
    { id: 'spending', label: 'Spending', description: 'Expense categories and patterns' }
  ];

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange, selectedView]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Mock data that changes based on selected view
      const baseData = {
        metrics: {
          netWorth: 125000,
          netWorthChange: 5.2,
          monthlyIncome: 8500,
          incomeChange: 2.1,
          monthlyExpenses: 6200,
          expenseChange: -1.5,
          savingsRate: 27,
          savingsRateChange: 3.2
        },
        recentActivity: [
          { type: 'income', amount: 3200, description: 'Salary Deposit', date: '2025-09-25' },
          { type: 'expense', amount: -89, description: 'Grocery Shopping', date: '2025-09-24' },
          { type: 'investment', amount: 500, description: 'Index Fund Purchase', date: '2025-09-23' }
        ]
      };
      
      // Add view-specific data
      baseData.currentViewData = getViewSpecificData(selectedView);
      baseData.contextualActions = getContextualActions(selectedView);
      baseData.globalActions = getGlobalActions();
      
      setDashboardData(baseData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getViewSpecificData = (view) => {
    const viewData = {
      'general': { 
        chartType: 'overview',
        data: [65, 59, 80, 81, 56, 55, 40],
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      'net worth': { 
        chartType: 'networth',
        data: [125000, 118000, 122000, 119000, 125000],
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May']
      },
      'investment': { 
        chartType: 'portfolio',
        data: [35, 25, 20, 15, 5],
        labels: ['Stocks', 'Bonds', 'ETFs', 'Crypto', 'Cash']
      },
      'spending': { 
        chartType: 'expenses',
        data: [1200, 800, 600, 400, 200],
        labels: ['Housing', 'Food', 'Transport', 'Entertainment', 'Other']
      }
    };
    return viewData[view] || viewData['general'];
  };

  const getContextualActions = (view) => {
    const actions = {
      'general': [
        { title: 'Optimize Emergency Fund', description: 'Build 6-month expense buffer', priority: 'high' },
        { title: 'Review Investment Mix', description: 'Rebalance portfolio allocation', priority: 'medium' }
      ],
      'net worth': [
        { title: 'Debt Consolidation', description: 'Reduce high-interest payments', priority: 'critical' },
        { title: 'Asset Diversification', description: 'Spread investment risk', priority: 'medium' }
      ],
      'investment': [
        { title: 'Tax-Loss Harvesting', description: 'Optimize tax efficiency', priority: 'high' },
        { title: 'Rebalance Portfolio', description: 'Adjust allocation percentages', priority: 'medium' }
      ],
      'spending': [
        { title: 'Cut Subscription Services', description: 'Cancel unused memberships', priority: 'medium' },
        { title: 'Negotiate Bills', description: 'Reduce monthly expenses', priority: 'high' }
      ]
    };
    return actions[view] || actions['general'];
  };

  const getGlobalActions = () => {
    return [
      { title: 'Increase 401k Contribution', description: 'Maximize employer match', priority: 'high' },
      { title: 'Open High-Yield Savings', description: 'Better interest rates available', priority: 'medium' },
      { title: 'Review Insurance Coverage', description: 'Ensure adequate protection', priority: 'low' }
    ];
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const metrics = dashboardData?.metrics || {};
  const currentViewData = dashboardData?.currentViewData || {};
  const contextualActions = dashboardData?.contextualActions || [];
  const globalActions = dashboardData?.globalActions || [];

  // Navigation setup
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Advisor', path: '/advisor', icon: MessageCircle },
    { name: 'Betting', path: '/betting', icon: Target },
    { name: 'Integrations', path: '/integrations', icon: LinkIcon }
  ];

  const isActive = (path) => location.pathname === path;
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Take Ctrl Styled Navbar with Navigation Items */}
      <div className="w-full border-b-2 border-black bg-white">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left - Logo */}
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center">
                <span className="font-bold text-sm font-title">I</span>
              </div>
              <span className="text-2xl font-black text-black font-title">Take Ctrl.</span>
            </Link>
            
            {/* Center - Navigation Items */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-4 py-2 rounded-full text-sm font-medium font-body flex items-center space-x-2 transition-colors border-2 ${
                      isActive(item.path)
                        ? 'bg-black text-white border-black'
                        : 'text-black hover:bg-gray-100 border-transparent hover:border-black'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
            
            {/* Right - Controls & User */}
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 text-sm border-2 border-black rounded-full bg-white text-black font-medium font-body focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="7d">7d</option>
                <option value="30d">30d</option>
                <option value="90d">90d</option>
                <option value="1y">1y</option>
              </select>
              
              <button
                onClick={() => setShowAmounts(!showAmounts)}
                className="flex items-center gap-1 px-3 py-2 text-sm border-2 border-black rounded-full hover:bg-black hover:text-white transition-colors font-body"
              >
                {showAmounts ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              
              <button
                onClick={handleLogout}
                className="p-2 border-2 border-black rounded-full hover:bg-red-500 hover:border-red-500 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
              
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 text-white rounded-full flex items-center justify-center font-bold border-2 border-black">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-160px)]">
          
          {/* Primary Visualization Panel (Left - 3/4 width) */}
          <div className="lg:col-span-3">
            <div className="h-full border-2 border-black rounded-lg p-4 bg-gradient-to-br from-blue-50 to-purple-50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-black font-title">
                  {selectedView.charAt(0).toUpperCase() + selectedView.slice(1)} Overview
                </h2>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600 font-medium font-body">AI-Generated</span>
                </div>
              </div>
              
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-black font-medium text-sm font-body">Generating AI visualization...</p>
                  </div>
                </div>
              ) : (
                <div className="h-full">
                  <DynamicChart viewData={currentViewData} showAmounts={showAmounts} />
                </div>
              )}
            </div>
          </div>

          {/* Secondary Control Panel (Right - 1/4 width) */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Compact View Controls */}
            <div className="border-2 border-black rounded-lg p-3 bg-gradient-to-br from-yellow-50 to-orange-50">
              <h3 className="text-sm font-bold text-black mb-3 font-title">Views</h3>
              <div className="space-y-1">
                {viewOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedView(option.id)}
                    className={`w-full text-left p-2 text-xs rounded-lg border transition-all font-medium font-body ${
                      selectedView === option.id
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 hover:border-black hover:bg-white'
                    }`}
                  >
                    <div className="font-bold">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Compact Action Items */}
            <div className="space-y-3">
              {/* Context Actions */}
              <div className="border-2 border-black rounded-lg p-3 bg-gradient-to-br from-green-50 to-teal-50">
                <h4 className="font-bold text-black mb-2 text-xs font-title">
                  {selectedView.charAt(0).toUpperCase() + selectedView.slice(1)} Actions
                </h4>
                <div className="space-y-2">
                  {contextualActions.slice(0, 2).map((action, index) => (
                    <ActionItem key={index} action={action} compact />
                  ))}
                </div>
              </div>

              {/* Global Actions */}
              <div className="border-2 border-black rounded-lg p-3 bg-gradient-to-br from-pink-50 to-rose-50">
                <h4 className="font-bold text-black mb-2 text-xs font-title">Global Actions</h4>
                <div className="space-y-2">
                  {globalActions.slice(0, 2).map((action, index) => (
                    <ActionItem key={index} action={action} compact />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dynamic Chart Component - AI-Generated Visualization
const DynamicChart = ({ viewData, showAmounts }) => {
  const { chartType, data, labels } = viewData;
  
  const getChartColors = (type) => {
    const colorSets = {
      'overview': ['bg-emerald-400', 'bg-teal-400', 'bg-cyan-400', 'bg-blue-400', 'bg-indigo-400'],
      'networth': ['bg-purple-400', 'bg-violet-400', 'bg-fuchsia-400', 'bg-pink-400', 'bg-rose-400'],
      'portfolio': ['bg-orange-400', 'bg-amber-400', 'bg-yellow-400', 'bg-lime-400', 'bg-green-400'],
      'expenses': ['bg-red-400', 'bg-pink-400', 'bg-purple-400', 'bg-indigo-400', 'bg-blue-400']
    };
    return colorSets[type] || colorSets['overview'];
  };

  const colors = getChartColors(chartType);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-4 border border-gray-200 rounded-lg bg-white/50">
        
        {/* Compact Chart Header */}
        <div className="text-center mb-3">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BarChart3 className="w-6 h-6 text-gray-600" />
            <h4 className="font-bold text-black text-sm font-title">AI {chartType.toUpperCase()}</h4>
          </div>
        </div>
        
        {/* Full Width Colorful Chart Bars */}
        <div className="flex items-end justify-between gap-2 h-48 mb-2 px-2">
          {data.map((value, index) => {
            const height = Math.max((value / Math.max(...data)) * 160, 20);
            return (
              <div key={index} className="flex flex-col items-center gap-1 flex-1 max-w-[80px]">
                <div 
                  className={`w-full ${colors[index % colors.length]} border-2 border-black rounded-t-lg shadow-lg transform hover:scale-105 transition-transform`}
                  style={{ height: `${height}px` }}
                />
                <span className="text-xs text-gray-600 font-medium truncate w-full text-center font-body">
                  {labels[index] || `Item ${index + 1}`}
                </span>
                {showAmounts && (
                  <span className="text-xs font-bold text-black font-body">
                    {typeof value === 'number' && value > 1000 
                      ? `$${(value/1000).toFixed(0)}k`
                      : value
                    }
                  </span>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Minimal AI Insights - One line only */}
        <div className="border-t border-gray-200 pt-1">
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-gradient-to-r from-green-400 to-blue-400 rounded-full"></div>
            <span className="text-xs font-bold text-black font-body">AI:</span>
            <p className="text-xs text-gray-600 font-body truncate">
              {getAIInsight(chartType)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// AI Insight Generator
const getAIInsight = (chartType) => {
  const insights = {
    'overview': 'Steady growth with optimization opportunities in spending.',
    'networth': 'Net worth up 5.2%. Consider asset diversification.',
    'portfolio': 'Well-balanced. Rebalance if allocation exceeds 5%.',
    'expenses': 'Housing costs good. Look for discretionary savings.'
  };
  return insights[chartType] || 'Financial trajectory looks positive.';
};

// Action Item Component
const ActionItem = ({ action, compact = false }) => {
  const getPriorityColor = (priority) => {
    const colors = {
      'critical': 'border-l-red-500 bg-gradient-to-r from-red-50 to-red-100',
      'high': 'border-l-orange-500 bg-gradient-to-r from-orange-50 to-yellow-100', 
      'medium': 'border-l-blue-500 bg-gradient-to-r from-blue-50 to-cyan-100',
      'low': 'border-l-gray-400 bg-gradient-to-r from-gray-50 to-gray-100'
    };
    return colors[priority] || colors['medium'];
  };

  const getPriorityIcon = (priority) => {
    if (priority === 'critical') return '🔴';
    if (priority === 'high') return '�';
    if (priority === 'medium') return '🔵';
    return '⚪';
  };

  if (compact) {
    return (
      <div className={`border-l-4 ${getPriorityColor(action.priority)} p-2 rounded-r-lg border border-black/10`}>
        <div className="flex items-center gap-2">
          <span className="text-xs">{getPriorityIcon(action.priority)}</span>
          <div className="flex-1">
            <h5 className="font-bold text-black text-xs mb-1 font-title">{action.title}</h5>
            <p className="text-xs text-gray-600 leading-tight font-body">{action.description}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border-l-4 ${getPriorityColor(action.priority)} p-3 rounded-r-lg border border-black/10`}>
      <div className="flex items-start gap-2">
        <span className="text-xs">{getPriorityIcon(action.priority)}</span>
        <div className="flex-1">
          <h5 className="font-bold text-black text-sm mb-1 font-title">{action.title}</h5>
          <p className="text-xs text-gray-600 font-body">{action.description}</p>
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;
