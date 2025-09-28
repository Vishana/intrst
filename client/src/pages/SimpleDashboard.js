import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Eye,
  EyeOff,
  BarChart3
} from 'lucide-react';
import LifePathVisualization from '../components/charts/LifePathVisualization';

const SimpleDashboard = () => {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false); // Simplified loading
  const [showAmounts, setShowAmounts] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Primary Visualization Panel (Left - 3/4 width) */}
          <div className="lg:col-span-3">
            {/* Chart Container with Dynamic Height */}
            <div className="min-h-[500px] border-2 border-black rounded-lg flex flex-col" style={{backgroundColor: '#98B8D6'}}>
              {/* Chart Content - Life Path Visualization */}
              <div className="flex-1">
                {loading ? (
                  <div className="h-[500px] flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="font-medium text-sm font-body text-black">Loading dashboard...</p>
                    </div>
                  </div>
                ) : (
                  <LifePathVisualization userId={user?.id || user?._id} timeRange={timeRange} />
                )}
              </div>
            </div>
          </div>

          {/* Secondary Control Panel (Right - 1/4 width) */}
          <div className="lg:col-span-1 space-y-4">

            {/* Controls */}
            <div className="border-2 border-black rounded-lg p-3" style={{backgroundColor: '#CED697'}}>
              <h3 className="text-sm font-bold mb-3 font-title text-black">Controls</h3>
              <div className="space-y-2">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border-2 border-black rounded-lg font-medium font-body focus:outline-none focus:ring-2 focus:ring-black text-black"
                  style={{
                    backgroundColor: 'white'
                  }}
                >
                  <option value="30d">30 Days</option>
                  <option value="1y">1 Year</option>
                  <option value="5y">5 Years</option>
                  <option value="lifetime">Lifetime</option>
                </select>
                
                <button
                  onClick={() => setShowAmounts(!showAmounts)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm border-2 border-black rounded-lg transition-colors font-body text-black"
                  style={{
                    backgroundColor: 'white'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#8A9253';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.color = 'black';
                  }}
                >
                  {showAmounts ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>{showAmounts ? 'Hide' : 'Show'} Amounts</span>
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="border-2 border-black rounded-lg p-3" style={{backgroundColor: '#E2DBAD'}}>
              <h4 className="font-bold mb-2 text-xs font-title text-black">Quick Stats</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-black">Current Age</span>
                  <span className="text-xs font-bold text-black">{user?.age || 25}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-black">Retirement Age</span>
                  <span className="text-xs font-bold text-black">{user?.retirementAge || 65}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-black">Years to Retirement</span>
                  <span className="text-xs font-bold text-black">{(user?.retirementAge || 65) - (user?.age || 25)}</span>
                </div>
              </div>
            </div>

            {/* Life Path Guide */}
            <div className="border-2 border-black rounded-lg p-3" style={{backgroundColor: '#98B8D6'}}>
              <h4 className="font-bold mb-2 text-xs font-title text-black">How It Works</h4>
              <div className="space-y-2 text-xs text-black">
                <p>• Green line shows your current financial path</p>
                <p>• Add life events to see alternative projections</p>
                <p>• Hover over points for detailed information</p>
                <p>• All projections use real market data and AI analysis</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;
