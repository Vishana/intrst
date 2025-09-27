import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  PiggyBank, 
  TrendingUp, 
  Building2, 
  Smartphone, 
  Upload, 
  Download, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  FileSpreadsheet,
  X
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const FinancialIntegrations = () => {
  const { user } = useAuth();
  const [connectedAccounts, setConnectedAccounts] = useState({
    fidelity: false,
    vanguard: false,
    schwab: false,
    paypal: false,
    venmo: false,
    mint: false,
    personalCapital: false,
    robinhood: false
  });

  const [uploadStatus, setUploadStatus] = useState({});
  const [activeModal, setActiveModal] = useState(null);
  const [userInsights, setUserInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user's existing integrations on component mount
  useEffect(() => {
    fetchUserIntegrations();
  }, []);

  const fetchUserIntegrations = async () => {
    try {
      const response = await axios.get('/api/integrations/user-data');
      const { connected, insights } = response.data;
      
      // Update connected accounts state
      const accountsState = {};
      integrations.forEach(integration => {
        accountsState[integration.id] = connected.some(
          conn => conn.provider === integration.id
        );
      });
      
      setConnectedAccounts(accountsState);
      setUserInsights(insights);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user integrations:', error);
      setLoading(false);
    }
  };

  const integrations = [
    {
      id: 'fidelity',
      name: 'Fidelity',
      type: 'Retirement & Investment',
      description: 'Connect your Fidelity accounts to track retirement savings, Roth IRA, and investment portfolios',
      icon: Building2,
      color: 'bg-green-500',
      csvType: 'retirement',
      apiNote: 'Uses Fidelity Web Services API'
    },
    {
      id: 'vanguard',
      name: 'Vanguard',
      type: 'Investment Management',
      description: 'Import portfolio data, mutual fund holdings, and retirement account information',
      icon: TrendingUp,
      color: 'bg-red-500',
      csvType: 'investment',
      apiNote: 'Uses Vanguard Developer API'
    },
    {
      id: 'schwab',
      name: 'Charles Schwab',
      type: 'Brokerage & Banking',
      description: 'Access trading data, account balances, and investment performance',
      icon: PiggyBank,
      color: 'bg-blue-500',
      csvType: 'brokerage',
      apiNote: 'Uses Schwab API'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      type: 'Digital Payments',
      description: 'Track PayPal transactions, purchases, and money transfers',
      icon: CreditCard,
      color: 'bg-blue-600',
      csvType: 'spending',
      apiNote: 'Uses PayPal REST API'
    },
    {
      id: 'venmo',
      name: 'Venmo',
      type: 'P2P Payments',
      description: 'Monitor Venmo payments and social spending patterns',
      icon: Smartphone,
      color: 'bg-blue-400',
      csvType: 'spending',
      apiNote: 'Uses Venmo API (Limited)'
    },
    {
      id: 'mint',
      name: 'Mint',
      type: 'Budget Tracking',
      description: 'Import budgets, spending categories, and financial goals from Mint',
      icon: PiggyBank,
      color: 'bg-green-600',
      csvType: 'budget',
      apiNote: 'Uses Intuit Mint API'
    },
    {
      id: 'personalCapital',
      name: 'Personal Capital',
      type: 'Wealth Management',
      description: 'Access net worth tracking, investment analysis, and retirement planning',
      icon: TrendingUp,
      color: 'bg-orange-500',
      csvType: 'wealth',
      apiNote: 'Uses Personal Capital API'
    },
    {
      id: 'robinhood',
      name: 'Robinhood',
      type: 'Stock Trading',
      description: 'Import stock trades, portfolio performance, and crypto holdings',
      icon: TrendingUp,
      color: 'bg-green-400',
      csvType: 'trading',
      apiNote: 'Uses Robinhood Web API'
    }
  ];

  const handleConnect = (integrationId) => {
    // In a real implementation, this would redirect to OAuth flow
    // For now, we'll show the CSV upload modal
    setActiveModal(integrationId);
  };

  const handleDisconnect = async (integrationId) => {
    try {
      const integration = integrations.find(i => i.id === integrationId);
      if (!integration) return;

      await axios.delete(`/api/integrations/disconnect/${integrationId}/${integration.csvType}`);
      
      setConnectedAccounts(prev => ({
        ...prev,
        [integrationId]: false
      }));
      setUploadStatus(prev => ({
        ...prev,
        [integrationId]: null
      }));

      toast.success(`${integration.name} disconnected successfully`);
      
      // Refresh user insights
      await fetchUserIntegrations();
    } catch (error) {
      console.error('Error disconnecting integration:', error);
      toast.error('Failed to disconnect integration');
    }
  };

  const handleFileUpload = async (integrationId, event) => {
    const file = event.target.files[0];
    if (!file || !file.type.includes('csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) return;

    try {
      setUploadStatus(prev => ({
        ...prev,
        [integrationId]: 'processing'
      }));

      const formData = new FormData();
      formData.append('csvFile', file);

      const response = await axios.post(
        `/api/integrations/upload/${integrationId}/${integration.csvType}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setConnectedAccounts(prev => ({
        ...prev,
        [integrationId]: true
      }));
      
      setUploadStatus(prev => ({
        ...prev,
        [integrationId]: 'success'
      }));
      
      setActiveModal(null);
      
      toast.success(`${integration.name} connected successfully! Processed ${response.data.recordsProcessed} records.`);
      
      // Refresh user insights
      await fetchUserIntegrations();

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus(prev => ({
        ...prev,
        [integrationId]: 'error'
      }));
      
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Upload failed';
      toast.error(`Upload failed: ${errorMessage}`);
    }
  };

  const downloadSampleCSV = (csvType, integrationName) => {
    // This will trigger the sample CSV download
    const link = document.createElement('a');
    link.href = `/api/integrations/sample-csv/${csvType}`;
    link.download = `${integrationName.toLowerCase()}_sample_data.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="border rounded-lg p-6">
                  <div className="h-6 bg-gray-200 rounded w-2/3 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Financial Integrations</h2>
            <p className="text-gray-600 mt-1">Connect your accounts to get a complete financial picture</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>{Object.values(connectedAccounts).filter(Boolean).length} connected</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrations.map((integration) => {
            const Icon = integration.icon;
            const isConnected = connectedAccounts[integration.id];
            const status = uploadStatus[integration.id];

            return (
              <div
                key={integration.id}
                className={`relative border rounded-lg p-6 transition-all duration-200 ${
                  isConnected 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg ${integration.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                      <p className="text-sm text-gray-500">{integration.type}</p>
                    </div>
                  </div>
                  
                  {isConnected && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4">{integration.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                  <span>{integration.apiNote}</span>
                  <ExternalLink className="w-3 h-3" />
                </div>

                <div className="flex items-center justify-between">
                  {!isConnected ? (
                    <button
                      onClick={() => handleConnect(integration.id)}
                      disabled={status === 'processing'}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {status === 'processing' ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Connect</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600 text-sm font-medium">Connected</span>
                      <button
                        onClick={() => handleDisconnect(integration.id)}
                        className="text-red-600 text-sm hover:text-red-700"
                      >
                        Disconnect
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => downloadSampleCSV(integration.csvType, integration.name)}
                    className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Sample CSV</span>
                  </button>
                </div>

                {/* Upload Modal */}
                {activeModal === integration.id && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg ${integration.color} flex items-center justify-center`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold">Connect {integration.name}</h3>
                        </div>
                        <button
                          onClick={() => setActiveModal(null)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-start space-x-2">
                            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-blue-800">
                              <p className="font-medium">Demo Mode</p>
                              <p>Upload a CSV file to simulate the {integration.name} integration. In production, this would use OAuth to connect your real account.</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload CSV File
                          </label>
                          <input
                            type="file"
                            accept=".csv"
                            onChange={(e) => handleFileUpload(integration.id, e)}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Don't have data? <button
                              onClick={() => downloadSampleCSV(integration.csvType, integration.name)}
                              className="text-blue-600 hover:text-blue-700 underline"
                            >
                              Download sample CSV
                            </button>
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3 mt-6">
                        <button
                          onClick={() => setActiveModal(null)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Connected Accounts Summary */}
      {Object.values(connectedAccounts).some(Boolean) && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Overview</h3>
          
          {userInsights && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-green-800">Net Worth</span>
                </div>
                <p className="text-2xl font-bold text-green-900 mt-2">
                  ${userInsights.totalNetWorth?.toLocaleString() || '0'}
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <PiggyBank className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium text-blue-800">Investments</span>
                </div>
                <p className="text-2xl font-bold text-blue-900 mt-2">
                  ${userInsights.totalInvestments?.toLocaleString() || '0'}
                </p>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-medium text-purple-800">Monthly Spending</span>
                </div>
                <p className="text-2xl font-bold text-purple-900 mt-2">
                  ${userInsights.monthlySpending?.toLocaleString() || '0'}
                </p>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-medium text-orange-800">Connected Sources</span>
                </div>
                <p className="text-2xl font-bold text-orange-900 mt-2">
                  {Object.values(connectedAccounts).filter(Boolean).length}
                </p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-green-800">Data Sources</span>
              </div>
              <p className="text-2xl font-bold text-green-900 mt-2">
                {Object.values(connectedAccounts).filter(Boolean).length}
              </p>
              <p className="text-sm text-green-600">Connected</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-blue-800">Last Sync</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 mt-2">
                {userInsights?.lastCalculated ? new Date(userInsights.lastCalculated).toLocaleDateString() : 'Today'}
              </p>
              <p className="text-sm text-blue-600">Updated</p>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium text-purple-800">Data Quality</span>
              </div>
              <p className="text-2xl font-bold text-purple-900 mt-2">
                {Object.values(connectedAccounts).filter(Boolean).length > 0 ? '98%' : '0%'}
              </p>
              <p className="text-sm text-purple-600">Complete</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialIntegrations;
