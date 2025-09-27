import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Plus, 
  TrendingUp, 
  Calendar,
  DollarSign,
  Edit,
  Trash2
} from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../common/LoadingSpinner';

const GoalsSidebar = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewGoalForm, setShowNewGoalForm] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/goals');
      setGoals(response.data.goals || []);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
      // Set some sample goals for demo
      setGoals(sampleGoals);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (goal) => {
    return Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTimeRemaining = (targetDate) => {
    const now = new Date();
    const target = new Date(targetDate);
    const diffTime = target - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day';
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.round(diffDays / 30)} months`;
    return `${Math.round(diffDays / 365)} years`;
  };

  if (loading) {
    return (
      <div className="card">
        <LoadingSpinner size="medium" text="Loading goals..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Goals Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Your Goals
            </h3>
          </div>
          
          <button
            onClick={() => setShowNewGoalForm(!showNewGoalForm)}
            className="p-2 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* New Goal Form */}
        {showNewGoalForm && (
          <NewGoalForm 
            onClose={() => setShowNewGoalForm(false)}
            onSubmit={() => {
              setShowNewGoalForm(false);
              fetchGoals();
            }}
          />
        )}

        {/* Goals List */}
        {goals.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-3">No goals set yet</p>
            <button
              onClick={() => setShowNewGoalForm(true)}
              className="btn-primary text-sm"
            >
              Create Your First Goal
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => (
              <GoalCard
                key={goal._id || goal.id}
                goal={goal}
                progress={calculateProgress(goal)}
                formatCurrency={formatCurrency}
                getTimeRemaining={getTimeRemaining}
                onUpdate={fetchGoals}
              />
            ))}
          </div>
        )}

        {goals.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View All Goals →
            </button>
          </div>
        )}
      </div>

      {/* Goal Achievement Stats */}
      <div className="card">
        <h4 className="font-semibold text-gray-900 mb-3">Achievement Stats</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Goals</span>
            <span className="font-semibold">{goals.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Completed</span>
            <span className="font-semibold text-green-600">
              {goals.filter(g => calculateProgress(g) >= 100).length}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">In Progress</span>
            <span className="font-semibold text-blue-600">
              {goals.filter(g => calculateProgress(g) < 100 && calculateProgress(g) > 0).length}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Saved</span>
            <span className="font-semibold text-primary-600">
              {formatCurrency(goals.reduce((sum, goal) => sum + goal.currentAmount, 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Goal Card Component
const GoalCard = ({ goal, progress, formatCurrency, getTimeRemaining, onUpdate }) => {
  const isCompleted = progress >= 100;
  const timeRemaining = getTimeRemaining(goal.targetDate);
  
  return (
    <div className={`p-4 rounded-lg border-2 transition-all ${
      isCompleted
        ? 'border-green-200 bg-green-50'
        : progress > 50
        ? 'border-blue-200 bg-blue-50'
        : 'border-gray-200 bg-white hover:border-primary-200'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h5 className="font-medium text-gray-900 text-sm">
            {goal.title}
          </h5>
          <p className="text-xs text-gray-500 mt-1">
            {goal.category}
          </p>
        </div>
        
        <div className="flex items-center space-x-1">
          {isCompleted && (
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          )}
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>{formatCurrency(goal.currentAmount)}</span>
          <span>{formatCurrency(goal.targetAmount)}</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isCompleted
                ? 'bg-green-500'
                : progress > 75
                ? 'bg-blue-500'
                : progress > 50
                ? 'bg-yellow-500'
                : 'bg-gray-400'
            }`}
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
        
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-500">
            {progress.toFixed(1)}% complete
          </span>
          <span className={`text-xs ${
            timeRemaining === 'Overdue' ? 'text-red-500' : 'text-gray-500'
          }`}>
            {timeRemaining}
          </span>
        </div>
      </div>

      {!isCompleted && (
        <div className="flex space-x-2">
          <button className="flex-1 bg-primary-600 text-white text-xs py-2 px-3 rounded hover:bg-primary-700 transition-colors">
            Add Funds
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <Edit className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};

// New Goal Form Component
const NewGoalForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'savings',
    targetAmount: '',
    targetDate: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // In a real app, you'd submit to your API
      await axios.post('/api/goals', formData);
      onSubmit();
    } catch (error) {
      console.error('Failed to create goal:', error);
      onSubmit(); // For demo purposes
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg mb-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Goal Title
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="input-field text-sm"
          placeholder="Emergency Fund"
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
            className="input-field text-sm"
          >
            <option value="savings">Savings</option>
            <option value="debt">Debt Payoff</option>
            <option value="investment">Investment</option>
            <option value="purchase">Purchase</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Amount
          </label>
          <input
            type="number"
            name="targetAmount"
            value={formData.targetAmount}
            onChange={handleChange}
            className="input-field text-sm"
            placeholder="10000"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Target Date
        </label>
        <input
          type="date"
          name="targetDate"
          value={formData.targetDate}
          onChange={handleChange}
          className="input-field text-sm"
          required
        />
      </div>

      <div className="flex space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 btn-secondary text-sm py-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 btn-primary text-sm py-2 disabled:opacity-50"
        >
          {loading ? (
            <LoadingSpinner size="small" />
          ) : (
            'Create Goal'
          )}
        </button>
      </div>
    </form>
  );
};

// Sample goals for demo
const sampleGoals = [
  {
    id: '1',
    title: 'Emergency Fund',
    category: 'savings',
    targetAmount: 10000,
    currentAmount: 6500,
    targetDate: '2025-12-31',
    description: '6 months of expenses'
  },
  {
    id: '2',
    title: 'New Car',
    category: 'purchase',
    targetAmount: 25000,
    currentAmount: 8200,
    targetDate: '2025-08-15',
    description: 'Down payment for Tesla Model 3'
  },
  {
    id: '3',
    title: 'Credit Card Debt',
    category: 'debt',
    targetAmount: 5000,
    currentAmount: 3100,
    targetDate: '2025-06-30',
    description: 'Pay off remaining balance'
  }
];

export default GoalsSidebar;
