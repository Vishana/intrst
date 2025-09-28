import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Eye,
  EyeOff,
  CreditCard, 
  PiggyBank, 
  TrendingUp,
  TrendingDown, 
  Building2, 
  Smartphone, 
  Upload, 
  Download, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  FileSpreadsheet,
  X,
  Link,
  Unlink,
  Activity,
  BarChart3
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Integrations = () => {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [showAmounts, setShowAmounts] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedView, setSelectedView] = useState('overview');
  
  // Integration functionality from FinancialIntegrations
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
      color: '#8A9253',
      csvType: 'retirement',
      apiNote: 'Uses Fidelity Web Services API'
    },
    {
      id: 'vanguard',
      name: 'Vanguard',
      type: 'Investment Management',
      description: 'Import portfolio data, mutual fund holdings, and retirement account information',
      icon: TrendingUp,
      color: '#98B8D6',
      csvType: 'investment',
      apiNote: 'Uses Vanguard Developer API'
    },
    {
      id: 'schwab',
      name: 'Charles Schwab',
      type: 'Brokerage & Banking',
      description: 'Access trading data, account balances, and investment performance',
      icon: PiggyBank,
      color: '#CED697',
      csvType: 'brokerage',
      apiNote: 'Uses Schwab API'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      type: 'Digital Payments',
      description: 'Track PayPal transactions, purchases, and money transfers',
      icon: CreditCard,
      color: '#E2DBAD',
      csvType: 'spending',
      apiNote: 'Uses PayPal REST API'
    },
    {
      id: 'venmo',
      name: 'Venmo',
      type: 'P2P Payments',
      description: 'Monitor Venmo payments and social spending patterns',
      icon: Smartphone,
      color: '#98B8D6',
      csvType: 'spending',
      apiNote: 'Uses Venmo API (Limited)'
    },
    {
      id: 'mint',
      name: 'Mint',
      type: 'Budget Tracking',
      description: 'Import budgets, spending categories, and financial goals from Mint',
      icon: PiggyBank,
      color: '#8A9253',
      csvType: 'budget',
      apiNote: 'Uses Intuit Mint API'
    },
    {
      id: 'personalCapital',
      name: 'Personal Capital',
      type: 'Wealth Management',
      description: 'Access net worth tracking, investment analysis, and retirement planning',
      icon: TrendingUp,
      color: '#CED697',
      csvType: 'wealth',
      apiNote: 'Uses Personal Capital API'
    },
    {
      id: 'robinhood',
      name: 'Robinhood',
      type: 'Stock Trading',
      description: 'Import stock trades, portfolio performance, and crypto holdings',
      icon: TrendingUp,
      color: '#E2DBAD',
      csvType: 'trading',
      apiNote: 'Uses Robinhood Web API'
    }
  ];

  const viewOptions = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'connect', label: 'Connect', icon: Link },
    { id: 'connected', label: 'Connected', icon: CheckCircle },
    { id: 'manage', label: 'Manage', icon: FileSpreadsheet }
  ];

  const handleConnect = (integrationId) => {
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
    const link = document.createElement('a');
    link.href = `/api/integrations/sample-csv/${csvType}`;
    link.download = `${integrationName.toLowerCase()}_sample_data.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (amount) => {
    if (!showAmounts) return '***';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const IntegrationsChart = () => {
    if (loading) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="font-medium text-sm text-black">Loading integrations...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col p-4">
        {selectedView === 'overview' && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center w-full">
              <Link className="w-16 h-16 mx-auto mb-4 text-black" />
              <h3 className="text-2xl font-bold text-black mb-2">Financial Integrations</h3>
              <p className="text-black mb-6">Connect your accounts for a complete financial picture</p>
              
              {/* Integration Summary */}
              <div className="grid grid-cols-2 gap-4 mb-6 max-w-md mx-auto">
                <div className="bg-white bg-opacity-20 rounded-lg p-3 border border-black">
                  <div className="text-xl font-bold text-black">{Object.values(connectedAccounts).filter(Boolean).length}</div>
                  <div className="text-sm text-black">Connected</div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3 border border-black">
                  <div className="text-xl font-bold text-black">{userInsights ? formatCurrency(userInsights.totalNetWorth || 0) : formatCurrency(0)}</div>
                  <div className="text-sm text-black">Total Value</div>
                </div>
              </div>
              
              {/* AI Insight */}
              <div className="border-t border-black pt-4 max-w-lg mx-auto">
                <div className="flex items-center gap-2 mb-2 justify-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-black font-medium">Gemini AI Analysis</span>
                </div>
                <p className="text-sm text-black">
                  {Object.values(connectedAccounts).filter(Boolean).length > 0 
                    ? `You have ${Object.values(connectedAccounts).filter(Boolean).length} accounts connected. Great start! Consider connecting more sources for better insights.`
                    : 'Connect your first financial account to start receiving personalized AI insights and recommendations.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}
        
        {selectedView === 'connect' && (
          <div className="h-full overflow-y-auto">
            <h3 className="text-lg font-bold text-black mb-4">Available Integrations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {integrations.map((integration) => {
                const Icon = integration.icon;
                const isConnected = connectedAccounts[integration.id];
                const status = uploadStatus[integration.id];

                return (
                  <div
                    key={integration.id}
                    className={`border rounded-lg p-4 transition-all duration-200 ${
                      isConnected 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-black bg-white bg-opacity-20'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{backgroundColor: integration.color}}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-black text-sm">{integration.name}</h4>
                          <p className="text-xs text-black">{integration.type}</p>
                        </div>
                      </div>
                      
                      {isConnected && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>

                    <p className="text-xs text-black mb-3">{integration.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-black mb-3">
                      <span>{integration.apiNote}</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>

                    <div className="flex items-center justify-between">
                      {!isConnected ? (
                        <button
                          onClick={() => handleConnect(integration.id)}
                          disabled={status === 'processing'}
                          className="flex items-center space-x-2 bg-black text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {status === 'processing' ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3 h-3" />
                              <span>Connect</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="text-green-600 text-xs font-medium">Connected</span>
                          <button
                            onClick={() => handleDisconnect(integration.id)}
                            className="text-red-600 text-xs hover:text-red-700"
                          >
                            Disconnect
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() => downloadSampleCSV(integration.csvType, integration.name)}
                        className="flex items-center space-x-1 text-black hover:text-gray-700 text-xs"
                      >
                        <Download className="w-3 h-3" />
                        <span>Sample</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {selectedView === 'connected' && (
          <div className="h-full overflow-y-auto">
            <h3 className="text-lg font-bold text-black mb-4">Connected Accounts ({Object.values(connectedAccounts).filter(Boolean).length})</h3>
            {Object.values(connectedAccounts).filter(Boolean).length === 0 ? (
              <div className="text-center py-8">
                <Link className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-black">No accounts connected yet</p>
                <p className="text-xs text-black mt-1">Connect your first account to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {integrations.filter(integration => connectedAccounts[integration.id]).map((integration) => {
                  const Icon = integration.icon;
                  return (
                    <div key={integration.id} className="bg-white bg-opacity-20 rounded-lg p-3 border border-black">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: integration.color }}
                          >
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-black text-sm">{integration.name}</h4>
                            <p className="text-xs text-black">{integration.type}</p>
                          </div>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex justify-between text-xs text-black">
                        <span>Status: Active</span>
                        <span>Last sync: Today</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        
        {selectedView === 'manage' && (
          <div className="h-full overflow-y-auto">
            <h3 className="text-lg font-bold text-black mb-4">Manage Data</h3>
            <div className="space-y-3">
              <div className="bg-white bg-opacity-20 rounded-lg p-3 border border-black">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-bold text-black">Sync All Accounts</div>
                    <div className="text-xs text-black">Update all connected data sources</div>
                  </div>
                  <button className="px-3 py-1 bg-black text-white text-xs rounded hover:bg-gray-800 transition-colors">
                    Sync Now
                  </button>
                </div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3 border border-black">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-bold text-black">Export Financial Data</div>
                    <div className="text-xs text-black">Download complete financial dataset</div>
                  </div>
                  <button className="px-3 py-1 bg-black text-white text-xs rounded hover:bg-gray-800 transition-colors">
                    Export CSV
                  </button>
                </div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3 border border-black">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-bold text-black">Privacy & Security</div>
                    <div className="text-xs text-black">Manage data permissions and encryption</div>
                  </div>
                  <button className="px-3 py-1 bg-black text-white text-xs rounded hover:bg-gray-800 transition-colors">
                    Settings
                  </button>
                </div>
              </div>
              
              {/* Financial Overview Stats */}
              {userInsights && Object.values(connectedAccounts).some(Boolean) && (
                <div className="mt-6">
                  <h4 className="text-sm font-bold text-black mb-3">Financial Summary</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-xs font-medium text-green-800">Net Worth</span>
                      </div>
                      <p className="text-lg font-bold text-green-900 mt-1">
                        {formatCurrency(userInsights.totalNetWorth || 0)}
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <PiggyBank className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-medium text-blue-800">Investments</span>
                      </div>
                      <p className="text-lg font-bold text-blue-900 mt-1">
                        {formatCurrency(userInsights.totalInvestments || 0)}
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4 text-purple-500" />
                        <span className="text-xs font-medium text-purple-800">Monthly Spending</span>
                      </div>
                      <p className="text-lg font-bold text-purple-900 mt-1">
                        {formatCurrency(userInsights.monthlySpending || 0)}
                      </p>
                    </div>
                    
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <FileSpreadsheet className="w-4 h-4 text-orange-500" />
                        <span className="text-xs font-medium text-orange-800">Data Quality</span>
                      </div>
                      <p className="text-lg font-bold text-orange-900 mt-1">
                        {Object.values(connectedAccounts).filter(Boolean).length > 0 ? '98%' : '0%'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {activeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              {(() => {
                const integration = integrations.find(i => i.id === activeModal);
                const Icon = integration?.icon || Link;
                return (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{backgroundColor: integration?.color}}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold">Connect {integration?.name}</h3>
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
                            <p>Upload a CSV file to simulate the {integration?.name} integration. In production, this would use OAuth to connect your real account.</p>
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
                          onChange={(e) => handleFileUpload(activeModal, e)}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Don't have data? <button
                            onClick={() => downloadSampleCSV(integration?.csvType, integration?.name)}
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
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Primary Visualization Panel (Left - 3/4 width) */}
          <div className="lg:col-span-3">
            <div className="h-[500px] border-2 border-black rounded-lg flex flex-col" style={{backgroundColor: '#98B8D6'}}>
              <div className="flex items-center justify-between p-4 border-b border-black">
                <h2 className="text-xl font-bold text-black">
                  Financial Integrations Hub
                </h2>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-black font-medium">Live Data Sync</span>
                </div>
              </div>
              
              <div className="flex-1">
                <IntegrationsChart />
              </div>
            </div>
          </div>

          {/* Secondary Control Panel (Right - 1/4 width) */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* View Controls */}
            <div className="border-2 border-black rounded-lg p-3" style={{backgroundColor: '#CED697'}}>
              <h3 className="text-sm font-bold text-black mb-3">Views</h3>
              <div className="space-y-1">
                {viewOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setSelectedView(option.id)}
                      className={`w-full text-left p-2 text-xs rounded-lg border transition-all font-medium flex items-center gap-2 ${
                        selectedView === option.id
                          ? 'border-black bg-black text-white'
                          : 'border-gray-200 hover:border-black hover:bg-white bg-white text-black'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Controls */}
            <div className="border-2 border-black rounded-lg p-3" style={{backgroundColor: '#E2DBAD'}}>
              <h3 className="text-sm font-bold text-black mb-3">Controls</h3>
              <div className="space-y-2">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border-2 border-black rounded-lg bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="7d">7 days</option>
                  <option value="30d">30 days</option>
                  <option value="90d">90 days</option>
                  <option value="1y">1 year</option>
                </select>
                
                <button
                  onClick={() => setShowAmounts(!showAmounts)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm border-2 border-black rounded-lg hover:bg-black hover:text-white transition-colors bg-white text-black"
                >
                  {showAmounts ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>{showAmounts ? 'Hide' : 'Show'} Amounts</span>
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="border-2 border-black rounded-lg p-3" style={{backgroundColor: '#98B8D6'}}>
              <h4 className="font-bold text-black mb-2 text-xs">Integration Stats</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-black">Connected:</span>
                  <span className="font-bold text-black">{Object.values(connectedAccounts).filter(Boolean).length}/8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black">Data Quality:</span>
                  <span className="font-bold text-green-600">
                    {Object.values(connectedAccounts).filter(Boolean).length > 0 ? '98%' : '0%'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black">Last Sync:</span>
                  <span className="font-bold text-black">
                    {userInsights?.lastCalculated ? new Date(userInsights.lastCalculated).toLocaleDateString() : 'Today'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Integrations;