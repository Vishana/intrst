import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import TopNavigationBar from '../components/layout/TopNavigationBar';
import DynamicVisualization from '../components/charts/DynamicVisualization';
import ActionItems from '../components/dashboard/ActionItems';
import axios from 'axios';

const SimpleDashboard = () => {
  const { user, logout } = useAuth();
  const [selectedView, setSelectedView] = useState('general');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const viewOptions = [
    { id: 'general', label: 'General', description: 'Overall financial overview' },
    { id: 'net worth', label: 'Net Worth', description: 'Assets, liabilities, and trends' },
    { id: 'investment', label: 'Investment', description: 'Portfolio allocation and performance' },
    { id: 'spending', label: 'Spending', description: 'Expense categories and patterns' }
  ];

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get('/api/integrations/user-data');
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <TopNavigationBar user={user} onLogout={handleLogout} />
      
      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-screen max-h-screen">
          
          {/* Primary Visualization Panel (Left - Takes up 2/3 of the space) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg h-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Financial Dashboard
                  </h1>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600">Live AI Analysis</span>
                  </div>
                </div>
                <p className="text-gray-600 mt-1">
                  AI-powered visualization of your {selectedView} data
                </p>
              </div>
              
              {/* Dynamic Visualization Area */}
              <div className="h-full p-0">
                <DynamicVisualization 
                  selectedView={selectedView} 
                  userData={userData}
                />
              </div>
            </div>
          </div>

          {/* Secondary Control and Information Panel (Right - Takes up 1/3 of the space) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Visualization Control Menu */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                View Controls
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Select a data view to dynamically update the visualization:
              </p>
              
              <div className="space-y-2">
                {viewOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedView(option.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                      selectedView === option.id
                        ? 'border-blue-500 bg-blue-50 text-blue-900 font-semibold shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.label}</span>
                      {selectedView === option.id && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {option.description}
                    </div>
                  </button>
                ))}
              </div>

              {/* Data Status Indicator */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Connected Sources:</span>
                  <span className="font-medium text-gray-900">
                    {userData?.connected?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium text-gray-900">
                    {userData?.summary?.lastDataSync ? 
                      new Date(userData.summary.lastDataSync).toLocaleDateString() : 
                      'Never'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Stats
              </h3>
              
              {loading ? (
                <div className="space-y-3">
                  <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Net Worth:</span>
                    <span className="font-semibold text-green-600">
                      ${(userData?.insights?.totalNetWorth || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Investments:</span>
                    <span className="font-semibold text-blue-600">
                      ${(userData?.insights?.totalInvestments || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Monthly Spending:</span>
                    <span className="font-semibold text-purple-600">
                      ${(userData?.insights?.monthlySpending || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Savings Rate:</span>
                    <span className="font-semibold text-orange-600">
                      {userData?.summary?.savingsRate 
                        ? `${userData.summary.savingsRate.toFixed(1)}%` 
                        : '0%'
                      }
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Items Display (Full Width Below) */}
        <div className="mt-6">
          <ActionItems 
            selectedView={selectedView}
            userData={userData}
            allDataInsights={userData?.insights}
          />
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;
