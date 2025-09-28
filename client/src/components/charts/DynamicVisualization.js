import React, { useState, useEffect } from 'react';

const DynamicVisualization = ({ selectedView, userData }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate AI-powered dynamic graph generation
    setLoading(true);
    const timer = setTimeout(() => {
      generateDynamicChart(selectedView, userData);
    }, 500);

    return () => clearTimeout(timer);
  }, [selectedView, userData]);

  const generateDynamicChart = (view, data) => {
    // Simulate AI-generated chart based on view type
    const chartConfigs = {
      general: {
        type: 'overview',
        title: 'Financial Overview',
        data: generateOverviewData(data),
        insights: [
          'Your spending has increased by 12% this month',
          'Investment portfolio is well-diversified',
          'Emergency fund goal is 67% complete'
        ]
      },
      'net worth': {
        type: 'line',
        title: 'Net Worth Trends',
        data: generateNetWorthData(data),
        insights: [
          'Net worth increased by $2,400 this quarter',
          'Investment growth outpacing expenses',
          'Debt-to-income ratio improving'
        ]
      },
      investment: {
        type: 'pie',
        title: 'Investment Allocation',
        data: generateInvestmentData(data),
        insights: [
          'Tech stocks comprise 35% of portfolio',
          'Consider rebalancing towards bonds',
          'International exposure is low at 8%'
        ]
      },
      spending: {
        type: 'bar',
        title: 'Spending Categories',
        data: generateSpendingData(data),
        insights: [
          'Food & dining expenses up 18% vs last month',
          'Transportation costs reduced by $120',
          'Entertainment spending within budget'
        ]
      }
    };

    setChartData(chartConfigs[view] || chartConfigs.general);
    setLoading(false);
  };

  const generateOverviewData = (data) => {
    return {
      netWorth: data?.insights?.totalNetWorth || 45000,
      investments: data?.insights?.totalInvestments || 32000,
      savings: 15000,
      debt: 8000
    };
  };

  const generateNetWorthData = (data) => {
    return [
      { month: 'Jan', value: 40000 },
      { month: 'Feb', value: 41200 },
      { month: 'Mar', value: 42800 },
      { month: 'Apr', value: 43500 },
      { month: 'May', value: 45000 },
      { month: 'Jun', value: 46200 }
    ];
  };

  const generateInvestmentData = (data) => {
    return [
      { category: 'US Stocks', value: 45, color: '#3B82F6' },
      { category: 'Bonds', value: 25, color: '#10B981' },
      { category: 'International', value: 15, color: '#F59E0B' },
      { category: 'Cash', value: 10, color: '#6B7280' },
      { category: 'Crypto', value: 5, color: '#8B5CF6' }
    ];
  };

  const generateSpendingData = (data) => {
    return [
      { category: 'Housing', amount: 1800, color: '#EF4444' },
      { category: 'Food', amount: 650, color: '#F59E0B' },
      { category: 'Transportation', amount: 320, color: '#10B981' },
      { category: 'Entertainment', amount: 280, color: '#3B82F6' },
      { category: 'Healthcare', amount: 150, color: '#8B5CF6' },
      { category: 'Other', amount: 200, color: '#6B7280' }
    ];
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          <div className="ml-4 text-gray-600">AI is generating your visualization...</div>
        </div>
      );
    }

    if (!chartData) return null;

    switch (chartData.type) {
      case 'overview':
        return renderOverviewChart();
      case 'line':
        return renderLineChart();
      case 'pie':
        return renderPieChart();
      case 'bar':
        return renderBarChart();
      default:
        return renderOverviewChart();
    }
  };

  const renderOverviewChart = () => (
    <div className="p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">{chartData.title}</h3>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-lg font-semibold text-green-800">Net Worth</div>
          <div className="text-3xl font-bold text-green-900">
            ${chartData.data.netWorth.toLocaleString()}
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-lg font-semibold text-blue-800">Investments</div>
          <div className="text-3xl font-bold text-blue-900">
            ${chartData.data.investments.toLocaleString()}
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="text-lg font-semibold text-purple-800">Savings</div>
          <div className="text-3xl font-bold text-purple-900">
            ${chartData.data.savings.toLocaleString()}
          </div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="text-lg font-semibold text-red-800">Debt</div>
          <div className="text-3xl font-bold text-red-900">
            ${chartData.data.debt.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );

  const renderLineChart = () => (
    <div className="p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">{chartData.title}</h3>
      <div className="relative h-64 bg-gray-50 rounded-lg flex items-end justify-around p-4">
        {chartData.data.map((point, index) => (
          <div key={index} className="flex flex-col items-center">
            <div 
              className="bg-blue-600 rounded-t-md mb-2 transition-all duration-500"
              style={{ 
                height: `${(point.value / 50000) * 200}px`,
                width: '30px'
              }}
            ></div>
            <span className="text-xs text-gray-600">{point.month}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPieChart = () => (
    <div className="p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">{chartData.title}</h3>
      <div className="flex items-center justify-center">
        <div className="relative w-64 h-64">
          <div className="w-64 h-64 rounded-full" style={{
            background: `conic-gradient(${chartData.data.map((item, index) => 
              `${item.color} ${chartData.data.slice(0, index).reduce((sum, curr) => sum + curr.value, 0)}% ${
                chartData.data.slice(0, index + 1).reduce((sum, curr) => sum + curr.value, 0)
              }%`
            ).join(', ')})`
          }}>
            <div className="absolute inset-8 bg-white rounded-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-sm text-gray-600">Portfolio</div>
                <div className="text-lg font-bold">100%</div>
              </div>
            </div>
          </div>
        </div>
        <div className="ml-8">
          {chartData.data.map((item, index) => (
            <div key={index} className="flex items-center mb-2">
              <div 
                className="w-4 h-4 rounded-full mr-3"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm text-gray-700">{item.category}: {item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBarChart = () => (
    <div className="p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">{chartData.title}</h3>
      <div className="space-y-4">
        {chartData.data.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className="w-24 text-sm text-gray-600 text-right mr-4">
              {item.category}
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
              <div 
                className="h-6 rounded-full transition-all duration-1000"
                style={{ 
                  backgroundColor: item.color,
                  width: `${(item.amount / 2000) * 100}%`
                }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                ${item.amount}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg h-full min-h-96">
      {renderChart()}
    </div>
  );
};

export default DynamicVisualization;