import React, { useState, useEffect } from 'react';
import {
  Target,
  Trophy,
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  Plus,
  Crown,
  Medal,
  Clock,
  Fire
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Betting = () => {
  const { user } = useAuth();
  const [bets, setBets] = useState([]);
  const [activeBets, setActiveBets] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateBet, setShowCreateBet] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchBettingData();
  }, []);

  const fetchBettingData = async () => {
    try {
      setLoading(true);
      const [betsRes, leaderboardRes] = await Promise.all([
        axios.get('/api/bets/my-bets'),
        axios.get('/api/bets/leaderboard')
      ]);
      
      setBets(betsRes.data.bets || []);
      setActiveBets(betsRes.data.bets?.filter(bet => bet.status === 'active') || []);
      setLeaderboard(leaderboardRes.data.leaderboard || []);
    } catch (error) {
      console.error('Failed to fetch betting data:', error);
      // Set sample data for demo
      setBets(sampleBets);
      setActiveBets(sampleBets.filter(bet => bet.status === 'active'));
      setLeaderboard(sampleLeaderboard);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProgressPercent = (bet) => {
    if (!bet.targetValue || !bet.currentValue) return 0;
    return Math.min(100, (bet.currentValue / bet.targetValue) * 100);
  };

  const getDaysRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading your challenges..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Target className="w-8 h-8 mr-3 text-primary-600" />
              Financial Challenges
            </h1>
            <p className="mt-1 text-gray-600">
              Gamify your finances and compete with others to reach your goals
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateBet(true)}
            className="mt-4 sm:mt-0 btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Challenge
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Active Challenges"
            value={activeBets.length}
            icon={Target}
            color="primary"
          />
          <StatsCard
            title="Total Winnings"
            value={formatCurrency(user?.gamification?.totalWinnings || 0)}
            icon={Trophy}
            color="success"
          />
          <StatsCard
            title="Success Rate"
            value={`${user?.gamification?.successRate || 0}%`}
            icon={TrendingUp}
            color="warning"
          />
          <StatsCard
            title="Current Streak"
            value={`${user?.gamification?.currentStreak || 0} days`}
            icon={Fire}
            color="danger"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Challenges */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">
                  Your Active Challenges
                </h3>
                <div className="flex space-x-2">
                  {['all', 'savings', 'spending', 'investment'].map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        selectedCategory === category
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {activeBets.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">No active challenges</p>
                  <button
                    onClick={() => setShowCreateBet(true)}
                    className="btn-primary"
                  >
                    Create Your First Challenge
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeBets.map((bet) => (
                    <BetCard
                      key={bet._id || bet.id}
                      bet={bet}
                      getProgressPercent={getProgressPercent}
                      getDaysRemaining={getDaysRemaining}
                      formatCurrency={formatCurrency}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Popular Challenges */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">
                  Popular Challenges
                </h3>
                <span className="text-sm text-gray-500">Join these trending challenges</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {popularChallenges.map((challenge, index) => (
                  <PopularChallengeCard
                    key={index}
                    challenge={challenge}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Leaderboard */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Crown className="w-5 h-5 mr-2 text-yellow-500" />
                  Leaderboard
                </h3>
                <span className="text-sm text-gray-500">This Month</span>
              </div>

              <div className="space-y-3">
                {leaderboard.map((player, index) => (
                  <LeaderboardRow
                    key={player.id || index}
                    player={player}
                    rank={index + 1}
                    isCurrentUser={player.id === user?.id}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  View Full Leaderboard →
                </button>
              </div>
            </div>

            {/* Achievement Showcase */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Achievements
                </h3>
              </div>

              <div className="space-y-3">
                {(user?.gamification?.recentAchievements || sampleAchievements).map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Medal className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {achievement.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {achievement.description}
                      </p>
                    </div>
                    <span className="text-xs text-yellow-600 font-medium">
                      +{achievement.points}pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Create Bet Modal */}
        {showCreateBet && (
          <CreateBetModal
            onClose={() => setShowCreateBet(false)}
            onSubmit={() => {
              setShowCreateBet(false);
              fetchBettingData();
            }}
          />
        )}
      </div>
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    primary: 'bg-primary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500'
  };

  return (
    <div className="metric-card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

// Bet Card Component
const BetCard = ({ bet, getProgressPercent, getDaysRemaining, formatCurrency }) => {
  const progress = getProgressPercent(bet);
  const daysLeft = getDaysRemaining(bet.endDate);
  const isCompleted = progress >= 100;

  return (
    <div className={`p-4 rounded-lg border-2 transition-all ${
      isCompleted
        ? 'border-green-200 bg-green-50'
        : 'border-primary-200 bg-primary-50 hover:border-primary-300'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{bet.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{bet.description}</p>
          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center">
              <DollarSign className="w-3 h-3 mr-1" />
              Stake: {formatCurrency(bet.stakeAmount)}
            </span>
            <span className="flex items-center">
              <Users className="w-3 h-3 mr-1" />
              {bet.participants} players
            </span>
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {daysLeft} days left
            </span>
          </div>
        </div>
        
        {isCompleted && (
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium text-green-600">Completed!</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress: {formatCurrency(bet.currentValue || 0)} / {formatCurrency(bet.targetValue)}</span>
          <span className="font-medium">{progress.toFixed(1)}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isCompleted ? 'bg-green-500' : 'bg-primary-500'
            }`}
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      </div>

      {!isCompleted && (
        <div className="flex space-x-2 mt-3">
          <button className="flex-1 bg-primary-600 text-white text-sm py-2 px-3 rounded hover:bg-primary-700 transition-colors">
            Update Progress
          </button>
          <button className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm">
            Details
          </button>
        </div>
      )}
    </div>
  );
};

// Popular Challenge Card Component
const PopularChallengeCard = ({ challenge, formatCurrency }) => (
  <div className="p-4 border border-gray-200 rounded-lg hover:border-primary-200 hover:bg-primary-50 transition-all cursor-pointer">
    <div className="flex items-center justify-between mb-2">
      <h4 className="font-medium text-gray-900">{challenge.title}</h4>
      <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
        {challenge.difficulty}
      </span>
    </div>
    
    <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
    
    <div className="flex items-center justify-between text-xs text-gray-500">
      <span>{challenge.participants} participants</span>
      <span>Prize pool: {formatCurrency(challenge.prizePool)}</span>
    </div>
    
    <button className="w-full mt-3 btn-primary text-sm py-2">
      Join Challenge
    </button>
  </div>
);

// Leaderboard Row Component
const LeaderboardRow = ({ player, rank, isCurrentUser, formatCurrency }) => {
  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-4 h-4 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-4 h-4 text-gray-400" />;
    if (rank === 3) return <Medal className="w-4 h-4 text-orange-500" />;
    return <span className="text-sm font-medium text-gray-500">#{rank}</span>;
  };

  return (
    <div className={`flex items-center space-x-3 p-2 rounded-lg ${
      isCurrentUser ? 'bg-primary-50 border border-primary-200' : 'hover:bg-gray-50'
    }`}>
      <div className="flex items-center justify-center w-8">
        {getRankIcon(rank)}
      </div>
      
      <div className="w-8 h-8 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
        <span className="text-white text-sm font-medium">
          {player.name?.charAt(0)?.toUpperCase() || 'U'}
        </span>
      </div>
      
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">
          {player.name} {isCurrentUser && '(You)'}
        </p>
        <p className="text-xs text-gray-500">
          {player.completedChallenges} challenges completed
        </p>
      </div>
      
      <div className="text-right">
        <p className="text-sm font-semibold text-gray-900">
          {formatCurrency(player.totalWinnings)}
        </p>
        <p className="text-xs text-gray-500">
          {player.points} pts
        </p>
      </div>
    </div>
  );
};

// Create Bet Modal Component
const CreateBetModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'savings',
    targetValue: '',
    stakeAmount: '',
    duration: '30',
    isPublic: true
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post('/api/bets', formData);
      onSubmit();
    } catch (error) {
      console.error('Failed to create bet:', error);
      onSubmit(); // For demo purposes
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
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Create New Challenge
          </h3>
          
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
                placeholder="Save $1000 in 30 days"
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
                className="input-field resize-none h-20"
                placeholder="Describe your challenge..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="savings">Savings</option>
                  <option value="spending">Spending</option>
                  <option value="investment">Investment</option>
                  <option value="debt">Debt Payoff</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Amount
                </label>
                <input
                  type="number"
                  name="targetValue"
                  value={formData.targetValue}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="1000"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stake Amount
                </label>
                <input
                  type="number"
                  name="stakeAmount"
                  value={formData.stakeAmount}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="25"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (days)
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
                  <option value="365">1 Year</option>
                </select>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                Make this challenge public (others can join)
              </label>
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
                {loading ? <LoadingSpinner size="small" /> : 'Create Challenge'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Sample Data
const sampleBets = [
  {
    id: '1',
    title: 'Emergency Fund Challenge',
    description: 'Save $5,000 for emergency fund',
    category: 'savings',
    targetValue: 5000,
    currentValue: 3200,
    stakeAmount: 50,
    participants: 12,
    endDate: '2025-03-15',
    status: 'active'
  },
  {
    id: '2',
    title: 'No Dining Out February',
    description: 'Avoid restaurant spending for 30 days',
    category: 'spending',
    targetValue: 0,
    currentValue: 45,
    stakeAmount: 25,
    participants: 8,
    endDate: '2025-02-28',
    status: 'active'
  }
];

const sampleLeaderboard = [
  { id: '1', name: 'Sarah Chen', totalWinnings: 1250, points: 890, completedChallenges: 12 },
  { id: '2', name: 'Mike Johnson', totalWinnings: 980, points: 750, completedChallenges: 9 },
  { id: '3', name: 'Emma Davis', totalWinnings: 750, points: 680, completedChallenges: 8 },
  { id: '4', name: 'You', totalWinnings: 420, points: 520, completedChallenges: 5 },
  { id: '5', name: 'Alex Kim', totalWinnings: 380, points: 480, completedChallenges: 6 }
];

const popularChallenges = [
  {
    title: 'January Savings Sprint',
    description: 'Save $500 this month',
    difficulty: 'Easy',
    participants: 45,
    prizePool: 2250
  },
  {
    title: 'Coffee Shop Detox',
    description: 'No coffee shop purchases for 2 weeks',
    difficulty: 'Medium',
    participants: 23,
    prizePool: 1150
  }
];

const sampleAchievements = [
  {
    title: 'First Challenge Complete!',
    description: 'Completed your first financial challenge',
    points: 100
  },
  {
    title: 'Savings Streak',
    description: '7 days of consistent saving',
    points: 50
  },
  {
    title: 'Budget Master',
    description: 'Stayed within budget for a full month',
    points: 200
  }
];

export default Betting;
