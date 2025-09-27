import React, { useState, useEffect } from 'react';
import {
  Target,
  TrendingUp,
  DollarSign,
  Calendar,
  Trophy,
  Plus,
  ArrowUp,
  ArrowDown,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  CreditCard
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const BettingSimple = () => {
  const { user } = useAuth();
  const [activeBets, setActiveBets] = useState([]);
  const [quickBets, setQuickBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateBet, setShowCreateBet] = useState(false);
  const [userStats, setUserStats] = useState(null);

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
      setUserStats(analyticsRes.data);
      
      // Set sample quick bet options
      setQuickBets([
        {
          title: "Save $500 this month",
          category: "savings",
          suggestedStake: 25,
          odds: "85%",
          participants: 12,
          difficulty: "Medium"
        },
        {
          title: "No dining out for 2 weeks", 
          category: "spending_limit",
          suggestedStake: 20,
          odds: "70%", 
          participants: 8,
          difficulty: "Hard"
        },
        {
          title: "Track expenses daily",
          category: "habit_change",
          suggestedStake: 15,
          odds: "90%",
          participants: 25,
          difficulty: "Easy"
        }
      ]);
      
    } catch (error) {
      console.error('Failed to fetch betting data:', error);
      setActiveBets([]);
      setUserStats({ winRate: 0, totalStaked: 0, totalWon: 0 });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading betting markets..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Financial Bets
            </h1>
            <p className="text-gray-600 text-sm">
              Put your money where your goals are
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateBet(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Bet
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <StatCard
                label="Win Rate"
                value={`${userStats?.winRate || 0}%`}
                icon={TrendingUp}
                trend={userStats?.winRate > 50 ? 'up' : 'down'}
              />
              <StatCard
                label="Total Staked"
                value={formatCurrency(userStats?.totalStaked || 0)}
                icon={DollarSign}
              />
              <StatCard
                label="Active Bets"
                value={activeBets.length}
                icon={Target}
              />
            </div>

            {/* Active Bets */}
            {activeBets.length > 0 && (
              <div className="card">
                <div className="card-header border-b border-gray-200">
                  <h3 className="text-lg font-semibold">Your Active Bets</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {activeBets.map((bet) => (
                    <ActiveBetRow key={bet._id} bet={bet} />
                  ))}
                </div>
              </div>
            )}

            {/* Quick Bet Markets */}
            <div className="card">
              <div className="card-header border-b border-gray-200">
                <h3 className="text-lg font-semibold">Popular Challenges</h3>
                <span className="text-sm text-gray-500">Join these trending bets</span>
              </div>
              
              <div className="space-y-3 p-6">
                {quickBets.map((bet, index) => (
                  <QuickBetCard
                    key={index}
                    bet={bet}
                    onPlace={() => console.log('Place bet:', bet)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Profile Card */}
            <div className="card text-center">
              <div className="p-6">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl font-bold">
                    {user?.firstName?.charAt(0) || 'U'}
                  </span>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-1">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Level {Math.floor((user?.gamification?.points || 0) / 100) + 1}
                </p>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-primary-600">
                      {user?.gamification?.points || 0}
                    </div>
                    <div className="text-xs text-gray-500">Points</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-green-600">
                      {user?.gamification?.currentStreak || 0}
                    </div>
                    <div className="text-xs text-gray-500">Streak</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold">Quick Actions</h3>
              </div>
              
              <div className="p-4 space-y-3">
                <button
                  onClick={() => setShowCreateBet(true)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  <div className="flex items-center">
                    <Target className="w-5 h-5 text-primary-600 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">Create Custom Bet</div>
                      <div className="text-xs text-gray-500">Set your own challenge</div>
                    </div>
                  </div>
                </button>
                
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors">
                  <div className="flex items-center">
                    <TrendingUp className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">Join Popular Bet</div>
                      <div className="text-xs text-gray-500">Browse trending challenges</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Help */}
            <div className="card">
              <div className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">How it works</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Set a financial goal, put money on the line. Succeed and get it back, fail and it goes to charity. Simple motivation.
                    </p>
                  </div>
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
              fetchBettingData();
            }}
          />
        )}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ label, value, icon: Icon, trend }) => (
  <div className="card p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className="flex items-center space-x-2">
        {trend && (
          <div className={`w-5 h-5 ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          </div>
        )}
        <Icon className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  </div>
);

// Active Bet Row Component
const ActiveBetRow = ({ bet }) => {
  const progress = Math.min(100, (bet.currentValue / bet.targetValue) * 100);
  const daysLeft = Math.max(0, bet.daysRemaining);
  
  return (
    <div className="p-4 hover:bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-900">{bet.title}</h4>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs rounded-full ${
            bet.onTrack 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {bet.onTrack ? 'On Track' : 'Behind'}
          </span>
          <span className="text-sm font-semibold text-gray-900">
            ${bet.stakeAmount}
          </span>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
        <span>${bet.currentValue || 0} / ${bet.targetValue}</span>
        <span className="flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          {daysLeft} days left
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            progress >= 100 ? 'bg-green-500' : 'bg-primary-500'
          }`}
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
    </div>
  );
};

// Quick Bet Card Component
const QuickBetCard = ({ bet, onPlace }) => (
  <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:bg-primary-50 transition-colors">
    <div className="flex items-center justify-between mb-2">
      <h4 className="font-medium text-gray-900">{bet.title}</h4>
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
        bet.difficulty === 'Easy' 
          ? 'bg-green-100 text-green-700'
          : bet.difficulty === 'Medium'
          ? 'bg-yellow-100 text-yellow-700' 
          : 'bg-red-100 text-red-700'
      }`}>
        {bet.difficulty}
      </span>
    </div>
    
    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
      <span className="flex items-center">
        <Users className="w-3 h-3 mr-1" />
        {bet.participants} playing
      </span>
      <span className="font-medium">Success rate: {bet.odds}</span>
    </div>
    
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">
        Suggested stake: ${bet.suggestedStake}
      </span>
      <button
        onClick={() => onPlace()}
        className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 transition-colors"
      >
        Place Bet
      </button>
    </div>
  </div>
);

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
        description: formData.description || `${formData.title} - ${formData.targetValue} target`, // Ensure description is not empty
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
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {step === 'details' ? 'Create New Bet' : 'Complete Payment'}
          </h3>
          
          {step === 'details' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Challenge Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Save $1000 this month"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Describe your financial goal and how you'll achieve it"
                  rows="2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Amount ($)
                </label>
                <input
                  type="number"
                  name="targetValue"
                  value={formData.targetValue}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="1000"
                  min="1"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stake ($)
                  </label>
                  <input
                    type="number"
                    name="stakeAmount"
                    value={formData.stakeAmount}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="25"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration
                  </label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="input-field"
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
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {loading ? <LoadingSpinner size="small" /> : 'Continue'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Payment Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Stake Amount:</span>
                    <span className="font-medium">${paymentIntent?.amount}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Processing Fee:</span>
                    <span>$0</span>
                  </div>
                  <div className="border-t pt-1 flex justify-between font-medium">
                    <span>Total:</span>
                    <span>${paymentIntent?.amount}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Commitment Contract</p>
                    <p>Your stake will be refunded if you succeed, or donated to charity if you don't.</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="flex-1 btn-secondary"
                >
                  Back
                </button>
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="flex-1 btn-primary disabled:opacity-50 flex items-center justify-center"
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

export default BettingSimple;
