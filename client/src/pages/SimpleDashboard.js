import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FinancialIntegrations from '../components/integrations/FinancialIntegrations';

const SimpleDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Intrst</h1>
          <p className="text-gray-600 mt-2">Your AI-powered finance dashboard</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('integrations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'integrations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Integrations
            </button>
          </nav>
        </div>

        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900">Dashboard</h3>
                <p className="text-gray-600 mt-2">Track your financial progress</p>
                <div className="mt-4">
                  <div className="text-2xl font-bold text-green-600">$2,345</div>
                  <div className="text-sm text-gray-500">Total Balance</div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900">AI Advisor</h3>
                <p className="text-gray-600 mt-2">Get personalized financial advice</p>
                <Link 
                  to="/advisor" 
                  className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Chat with AI
                </Link>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900">Betting Challenges</h3>
                <p className="text-gray-600 mt-2">Join financial challenges</p>
                <Link 
                  to="/betting" 
                  className="mt-4 inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                  View Challenges
                </Link>
              </div>
            </div>
            
            <div className="mt-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">5</div>
                    <div className="text-sm text-gray-500">Active Goals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">$1,200</div>
                    <div className="text-sm text-gray-500">Monthly Savings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-600">3</div>
                    <div className="text-sm text-gray-500">Active Bets</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-orange-600">78%</div>
                    <div className="text-sm text-gray-500">Success Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'integrations' && (
          <FinancialIntegrations />
        )}
      </div>
    </div>
  );
};

export default SimpleDashboard;
