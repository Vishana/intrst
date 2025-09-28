import React from 'react';
import FinancialIntegrations from '../components/integrations/FinancialIntegrations';

const Integrations = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Financial Integrations</h1>
          <p className="mt-2 text-gray-600">
            Connect your financial accounts to get personalized insights and recommendations.
          </p>
        </div>

        {/* Main Content */}
        <FinancialIntegrations />
      </div>
    </div>
  );
};

export default Integrations;