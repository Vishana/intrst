import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Trophy,
  Eye,
  EyeOff,
  BarChart3,
  Calendar,
  Clock,
  Award,
  Activity,
  Users,
  Fire,
  Crown,
  Medal,
  Plus,
  CheckCircle,
  AlertCircle,
  CreditCard,
  X
} from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Betting = () => {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [showAmounts, setShowAmounts] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedView, setSelectedView] = useState('overview');
  const [showCreateBet, setShowCreateBet] = useState(false);
  
  // Betting-specific state
  const [activeBets, setActiveBets] = useState([]);
  const [bettingHistory, setBettingHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [bettingStats, setBettingStats] = useState({
    totalWagered: 2500,
    totalWon: 3100,
    winRate: 68,
    activeBets: 5,
    biggestWin: 850,
    currentStreak: 3
  });

  const viewOptions = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'active', label: 'Active Bets', icon: Activity },
    { id: 'leaderboard', label: 'Leaderboard', icon: Crown },
    { id: 'history', label: 'History', icon: BarChart3 }
  ];

  const formatCurrency = (amount) => {
    if (!showAmounts) return '***';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Mock data initialization
  useEffect(() => {
    fetchBettingData();
  }, []);

  const fetchBettingData = async () => {
    try {
      setLoading(true);
      const [betsRes, analyticsRes] = await Promise.all([
        axios.get('/api/bets/my-bets?status=active'),
        axios.get('/api/bets/analytics/overview')
      ]);
      
      setActiveBets(betsRes.data.bets || []);
      setBettingStats({
        ...bettingStats,
        totalWagered: analyticsRes.data.totalStaked || bettingStats.totalWagered,
        totalWon: analyticsRes.data.totalWon || bettingStats.totalWon,
        winRate: analyticsRes.data.winRate || bettingStats.winRate,
        activeBets: (betsRes.data.bets || []).length
      });
      
    } catch (error) {
      console.error('Failed to fetch betting data:', error);
      // Fall back to mock data
      const mockActiveBets = [
        {
          id: 1,
          title: 'Emergency Fund Challenge',
          description: 'Save $5,000 for emergency fund',
          wager: 150,
          potentialPayout: 285,
          progress: 64,
          status: 'active',
          expiresAt: '2025-02-15T23:59:59Z'
        },
        {
          id: 2,
          title: 'No Dining Out February',
          description: 'Avoid restaurant spending for 30 days',
          wager: 100,
          potentialPayout: 180,
          progress: 23,
          status: 'active',
          expiresAt: '2025-02-28T23:59:59Z'
        },
        {
          id: 3,
          title: 'Investment Goal',
          description: 'Increase portfolio by 15% this quarter',
          wager: 200,
          potentialPayout: 350,
          progress: 87,
          status: 'winning',
          expiresAt: '2025-03-31T23:59:59Z'
        }
      ];

      const mockLeaderboard = [
        { id: 1, name: 'Sarah Chen', points: 1250, wins: 12 },
        { id: 2, name: 'Mike Johnson', points: 980, wins: 9 },
        { id: 3, name: 'Emma Davis', points: 750, wins: 8 },
        { id: 4, name: 'You', points: 520, wins: 5 },
        { id: 5, name: 'Alex Kim', points: 480, wins: 6 }
      ];

      setActiveBets(mockActiveBets);
      setLeaderboard(mockLeaderboard);
    } finally {
      setLoading(false);
    }
  };

  const BettingVisualization = () => (
    <div className="flex-1 p-6">
      {selectedView === 'overview' && (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <Target className="w-16 h-16 mx-auto mb-4 text-black" />
            <h3 className="text-2xl font-bold text-black mb-2 font-title">Financial Betting Overview</h3>
            <p className="text-black mb-6 font-body">Track your financial challenges and competitions</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6 max-w-md mx-auto">
              <div className="bg-white bg-opacity-20 rounded-lg p-3 border border-black">
                <div className="text-xl font-bold text-black font-title">{bettingStats.winRate}%</div>
                <div className="text-sm text-black font-body">Win Rate</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3 border border-black">
                <div className="text-xl font-bold text-black font-title">{formatCurrency(bettingStats.totalWon - bettingStats.totalWagered)}</div>
                <div className="text-sm text-black font-body">Net Profit</div>
              </div>
            </div>
            
            <div className="border-t border-black pt-4 max-w-lg mx-auto">
              <div className="flex items-center gap-2 mb-2 justify-center">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-black font-medium font-body">AI Analysis</span>
              </div>
              <p className="text-sm text-black font-body">
                Your {bettingStats.winRate}% win rate is excellent! Consider increasing stakes on high-confidence bets 
                while maintaining disciplined risk management.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {selectedView === 'active' && (
        <div className="h-full overflow-y-auto">
          <h3 className="text-lg font-bold text-black mb-4 font-title">Active Challenges</h3>
          {activeBets.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-black font-body">No active bets yet</p>
              <p className="text-xs text-black mt-1 font-body">Create your first challenge to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeBets.map((bet) => {
                // Handle both API data and mock data structure
                const betId = bet._id || bet.id;
                const title = bet.title;
                const description = bet.description;
                const stakeAmount = bet.stakeAmount || bet.wager;
                const targetValue = bet.targetValue;
                const currentValue = bet.currentValue || 0;
                const progress = targetValue ? Math.min(100, (currentValue / targetValue) * 100) : (bet.progress || 0);
                const status = bet.status;
                const endDate = bet.endDate || bet.expiresAt;
                const daysLeft = endDate ? Math.max(0, Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24))) : 0;
                
                return (
                  <div key={betId} className="bg-white bg-opacity-20 rounded-lg p-3 border border-black">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-black text-sm font-title">{title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium font-body ${
                        status === 'winning' || (progress >= 75) ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {status === 'winning' || (progress >= 75) ? 'On Track' : 'Active'}
                      </span>
                    </div>
                    <p className="text-xs text-black mb-2 font-body">{description}</p>
                    
                    {/* Progress section */}
                    {targetValue && (
                      <div className="flex items-center justify-between text-xs text-black font-body mb-2">
                        <span>${currentValue} / ${targetValue}</span>
                        <span>{daysLeft} days left</span>
                      </div>
                    )}
                    
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-black h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-xs text-black font-body">
                      <span>Stake: ${stakeAmount}</span>
                      <span>Progress: {Math.round(progress)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      
      {selectedView === 'leaderboard' && (
        <div className="h-full overflow-y-auto">
          <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2 font-title">
            <Crown className="w-5 h-5" />
            Leaderboard
          </h3>
          <div className="space-y-2">
            {leaderboard.map((player, index) => (
              <div 
                key={player.id} 
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  player.name === 'You' 
                    ? 'bg-yellow-100 border-yellow-300' 
                    : 'bg-white bg-opacity-20 border-black'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center">
                    {index < 3 ? (
                      index === 0 ? <Crown className="w-4 h-4 text-yellow-500" /> :
                      <Medal className="w-4 h-4 text-gray-400" />
                    ) : (
                      <span className="text-sm font-bold text-black font-title">#{index + 1}</span>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-black font-title">{player.name}</div>
                    <div className="text-xs text-black font-body">{player.wins} wins</div>
                  </div>
                </div>
                <div className="text-sm font-bold text-black font-title">{player.points}pts</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {selectedView === 'history' && (
        <div className="h-full overflow-y-auto">
          <h3 className="text-lg font-bold text-black mb-4 font-title">Betting History</h3>
          <div className="space-y-2">
            <div className="bg-white bg-opacity-20 rounded-lg p-3 border border-black">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-bold text-black font-title">Savings Challenge - Won</div>
                  <div className="text-xs text-black font-body">Completed Jan 2025</div>
                </div>
                <div className="text-sm font-bold text-green-600 font-title">{formatCurrency(180)}</div>
              </div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3 border border-black">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-bold text-black font-title">Investment Goal - Lost</div>
                  <div className="text-xs text-black font-body">Failed Dec 2024</div>
                </div>
                <div className="text-sm font-bold text-red-600 font-title">-{formatCurrency(75)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Primary Visualization Panel (Left - 3/4 width) */}
          <div className="lg:col-span-3">
            <div className="h-[500px] border-2 border-black rounded-lg flex flex-col" style={{backgroundColor: '#98B8D6'}}>
              <div className="flex-1">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="font-medium text-sm font-body text-black">Loading betting data...</p>
                    </div>
                  </div>
                ) : (
                  <BettingVisualization />
                )}
              </div>
            </div>
          </div>

          {/* Secondary Control Panel (Right - 1/4 width) */}
          <div className="lg:col-span-1 space-y-4">

            {/* View Controls */}
            <div className="border-2 border-black rounded-lg p-3" style={{backgroundColor: '#CED697'}}>
              <h3 className="text-sm font-bold mb-3 font-title text-black">Views</h3>
              <div className="space-y-1">
                {viewOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setSelectedView(option.id)}
                      className={`w-full text-left p-2 text-xs rounded-lg border transition-all font-medium font-body flex items-center gap-2 ${
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
                  <option value="7d">7 Days</option>
                  <option value="30d">30 Days</option>
                  <option value="90d">90 Days</option>
                  <option value="1y">1 Year</option>
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

                <button
                  onClick={() => setShowCreateBet(true)}
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
                  <Plus className="w-4 h-4" />
                  <span>Create Bet</span>
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="border-2 border-black rounded-lg p-3" style={{backgroundColor: '#98B8D6'}}>
              <h4 className="font-bold mb-2 text-xs font-title text-black">Quick Stats</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-black">Active Bets</span>
                  <span className="text-xs font-bold text-black">{bettingStats.activeBets}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-black">Win Streak</span>
                  <span className="text-xs font-bold text-black">{bettingStats.currentStreak}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-black">Biggest Win</span>
                  <span className="text-xs font-bold text-black">{formatCurrency(bettingStats.biggestWin)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create Bet Modal */}
        {showCreateBet && (
          <CreateBetModal
            onClose={() => setShowCreateBet(false)}
            onSuccess={() => {
              setShowCreateBet(false);
              fetchBettingData(); // Refresh betting data when new bet is created
            }}
          />
        )}
      </div>
    </div>
  );
};

// Create Bet Modal Component
const CreateBetModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'savings',
    targetValue: '',
    stakeAmount: '',
    duration: '30'
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('details'); // 'details', 'payment'
  const [paymentIntent, setPaymentIntent] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create the bet
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + parseInt(formData.duration));
      
      const betResponse = await axios.post('/api/bets', {
        ...formData,
        description: formData.description || `${formData.title} - ${formData.targetValue} target`,
        targetMetric: 'amount_saved',
        endDate: endDate.toISOString(),
        selectedCharity: 'local_charity',
        visibility: 'private'
      });
      
      // Create payment intent
      const paymentResponse = await axios.post(
        `/api/bets/${betResponse.data.bet._id}/create-payment-intent`
      );
      
      setPaymentIntent({
        ...paymentResponse.data,
        betId: betResponse.data.bet._id
      });
      setStep('payment');
      
    } catch (error) {
      console.error('Failed to create bet:', error);
      alert('Failed to create bet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    // In a real implementation, you'd integrate Stripe Elements here
    // For now, we'll simulate payment
    setLoading(true);
    
    try {
      await axios.post(`/api/bets/${paymentIntent.betId}/activate`, {
        paymentIntentId: paymentIntent.paymentIntentId,
        amountPaid: paymentIntent.amount
      });
      
      onSuccess();
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full border-2 border-black">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold font-title">
              {step === 'details' ? 'Create New Bet' : 'Complete Payment'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {step === 'details' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1 font-body">
                  Challenge Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border-2 border-black rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-black text-black"
                  style={{ backgroundColor: 'white' }}
                  placeholder="Save $1000 this month"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1 font-body">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border-2 border-black rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-black text-black"
                  style={{ backgroundColor: 'white' }}
                  placeholder="Describe your financial goal and how you'll achieve it"
                  rows="2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1 font-body">
                  Target Amount ($)
                </label>
                <input
                  type="number"
                  name="targetValue"
                  value={formData.targetValue}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border-2 border-black rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-black text-black"
                  style={{ backgroundColor: 'white' }}
                  placeholder="1000"
                  min="1"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-black mb-1 font-body">
                    Stake ($)
                  </label>
                  <input
                    type="number"
                    name="stakeAmount"
                    value={formData.stakeAmount}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border-2 border-black rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-black text-black"
                    style={{ backgroundColor: 'white' }}
                    placeholder="25"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1 font-body">
                    Duration
                  </label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border-2 border-black rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-black text-black"
                    style={{ backgroundColor: 'white' }}
                  >
                    <option value="7">1 Week</option>
                    <option value="30">1 Month</option>
                    <option value="90">3 Months</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-sm font-medium text-black border-2 border-black rounded-lg hover:bg-gray-100 transition-colors font-body"
                  style={{ backgroundColor: 'white' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white border-2 border-black rounded-lg hover:bg-gray-800 transition-colors font-body disabled:opacity-50"
                  style={{ backgroundColor: 'black' }}
                >
                  {loading ? <LoadingSpinner size="small" /> : 'Continue'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg p-4 border-2 border-black" style={{ backgroundColor: '#E2DBAD' }}>
                <h4 className="font-medium mb-2 font-title">Payment Summary</h4>
                <div className="space-y-1 text-sm font-body">
                  <div className="flex justify-between">
                    <span>Stake Amount:</span>
                    <span className="font-medium">${paymentIntent?.amount}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Processing Fee:</span>
                    <span>$0</span>
                  </div>
                  <div className="border-t border-black pt-1 flex justify-between font-medium">
                    <span>Total:</span>
                    <span>${paymentIntent?.amount}</span>
                  </div>
                </div>
              </div>

              <div className="border-2 border-black rounded-lg p-3" style={{ backgroundColor: '#98B8D6' }}>
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-black mt-0.5" />
                  <div className="text-sm text-black">
                    <p className="font-medium font-title">Commitment Contract</p>
                    <p className="font-body">Your stake will be refunded if you succeed, or donated to charity if you don't.</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="flex-1 px-4 py-2 text-sm font-medium text-black border-2 border-black rounded-lg hover:bg-gray-100 transition-colors font-body"
                  style={{ backgroundColor: 'white' }}
                >
                  Back
                </button>
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white border-2 border-black rounded-lg hover:bg-gray-800 transition-colors font-body disabled:opacity-50 flex items-center justify-center"
                  style={{ backgroundColor: 'black' }}
                >
                  {loading ? (
                    <LoadingSpinner size="small" />
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay ${paymentIntent?.amount}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Betting;
