import React, { useState } from 'react';
import {
  User,
  Settings,
  Bell,
  Shield,
  CreditCard,
  Download,
  Trash2,
  Edit,
  Save,
  X,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  Target,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAmounts, setShowAmounts] = useState(true);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'financial', label: 'Financial Info', icon: TrendingUp },
    { id: 'goals', label: 'Goals & Preferences', icon: Target },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard }
  ];

  const formatCurrency = (amount) => {
    if (!showAmounts) return '****';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user?.name || 'User Profile'}
              </h1>
              <p className="text-gray-600">
                Manage your account settings and preferences
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <button className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                    <Download className="w-4 h-4 mr-3" />
                    Export Data
                  </button>
                  <button className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4 mr-3" />
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="card">
              {activeTab === 'profile' && (
                <ProfileTab
                  user={user}
                  isEditing={isEditing}
                  setIsEditing={setIsEditing}
                  loading={loading}
                  setLoading={setLoading}
                  updateUser={updateUser}
                />
              )}

              {activeTab === 'financial' && (
                <FinancialTab
                  user={user}
                  formatCurrency={formatCurrency}
                  showAmounts={showAmounts}
                  setShowAmounts={setShowAmounts}
                />
              )}

              {activeTab === 'goals' && (
                <GoalsTab user={user} />
              )}

              {activeTab === 'notifications' && (
                <NotificationsTab user={user} />
              )}

              {activeTab === 'security' && (
                <SecurityTab user={user} />
              )}

              {activeTab === 'billing' && (
                <BillingTab user={user} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile Tab Component
const ProfileTab = ({ user, isEditing, setIsEditing, loading, setLoading, updateUser }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.profile?.phone || '',
    location: user?.profile?.location || '',
    bio: user?.profile?.bio || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // In a real app, you'd call your API to update the profile
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      updateUser({ ...user, ...formData, profile: { ...user?.profile, ...formData } });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="btn-secondary flex items-center"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <select
                value={formData.age || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                className="input-field"
              >
                <option value="">Select your age range</option>
                <option value="18-25">18-25</option>
                <option value="26-35">26-35</option>
                ...
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Life Stage
              </label>
              <select
                value={formData.lifeStage || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, lifeStage: e.target.value }))}
                className="input-field"
              >
                <option value="student">Student</option>
                <option value="single">Single Professional</option>
                <option value="couple">Couple (No Kids)</option>
                ...
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Goal
              </label>
              <select
                value={formData.primaryGoal || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, primaryGoal: e.target.value }))}
                className="input-field"
              >
                <option value="save-emergency">Build Emergency Fund</option>
                <option value="pay-debt">Pay Off Debt</option>
                <option value="invest-retirement">Invest for Retirement</option>
                ...
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="input-field"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="input-field"
                placeholder="City, Country"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              className="input-field resize-none h-24"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center disabled:opacity-50"
            >
              {loading ? (
                <LoadingSpinner size="small" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="btn-secondary flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <ProfileField
                icon={User}
                label="Full Name"
                value={user?.name || 'Not provided'}
              />
              <ProfileField
                icon={Mail}
                label="Email Address"
                value={user?.email || 'Not provided'}
              />
            </div>
            <div className="space-y-4">
              <ProfileField
                icon={Phone}
                label="Phone Number"
                value={user?.profile?.phone || 'Not provided'}
              />
              <ProfileField
                icon={MapPin}
                label="Location"
                value={user?.profile?.location || 'Not provided'}
              />
            </div>
          </div>

          {user?.profile?.bio && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Bio</h4>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                {user.profile.bio}
              </p>
            </div>
          )}

          {/* Account Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">
                {user?.gamification?.level || 1}
              </p>
              <p className="text-sm text-gray-600">Level</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-success-600">
                {user?.gamification?.points || 0}
              </p>
              <p className="text-sm text-gray-600">Points</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {user?.gamification?.completedChallenges || 0}
              </p>
              <p className="text-sm text-gray-600">Challenges</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Financial Tab Component
const FinancialTab = ({ user, formatCurrency, showAmounts, setShowAmounts }) => {
  const { saveOnboarding } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // local form state (strings for inputs)
  const [form, setForm] = useState(() => ({
    monthlyIncome: valueStr(user?.financialProfile?.monthlyIncome),
    monthlyExpenses: valueStr(user?.financialProfile?.monthlyExpenses),
    currentSavings: valueStr(user?.financialProfile?.currentSavings),
    debt: valueStr(user?.financialProfile?.debt),
  }));

  const onChange = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const cancel = () => {
    setForm({
      monthlyIncome: valueStr(user?.financialProfile?.monthlyIncome),
      monthlyExpenses: valueStr(user?.financialProfile?.monthlyExpenses),
      currentSavings: valueStr(user?.financialProfile?.currentSavings),
      debt: valueStr(user?.financialProfile?.debt),
    });
    setIsEditing(false);
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      monthlyIncome: clampNonNeg(form.monthlyIncome),
      monthlyExpenses: clampNonNeg(form.monthlyExpenses),
      currentSavings: clampNonNeg(form.currentSavings),
      debt: clampNonNeg(form.debt),
    };
    try {
      const res = await saveOnboarding(payload);
      if (res?.success) setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  // view values (numbers) -> formatted or ****
  const view = {
    income: showAmounts ? formatCurrency(toNumber(form.monthlyIncome)) : '****',
    expenses: showAmounts ? formatCurrency(toNumber(form.monthlyExpenses)) : '****',
    savings: showAmounts ? formatCurrency(toNumber(form.currentSavings)) : '****',
    debt: showAmounts ? formatCurrency(toNumber(form.debt)) : '****',
    health: user?.financialProfile?.healthScore ?? 75,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Financial Information</h2>
        <div className="flex gap-2">
          <button onClick={() => setShowAmounts(!showAmounts)} className="btn-secondary flex items-center">
            {showAmounts ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showAmounts ? 'Hide Amounts' : 'Show Amounts'}
          </button>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="btn-secondary flex items-center">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </button>
          )}
        </div>
      </div>

      {/* View mode */}
      {!isEditing && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FinancialMetricCard title="Monthly Income"   value={view.income}   change={+5.2} />
            <FinancialMetricCard title="Monthly Expenses" value={view.expenses} change={-2.1} />
            <FinancialMetricCard title="Current Savings"  value={view.savings}  change={+12.3} />
            <FinancialMetricCard title="Total Debt"       value={view.debt}     change={-8.5} />
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Financial Health Score</h4>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="w-full bg-blue-200 rounded-full h-3">
                  <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${view.health}%` }} />
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-900">{view.health}</span>
            </div>
            <p className="text-sm text-blue-800 mt-2">
              Your financial health is looking good! Keep up the great work.
            </p>
          </div>
        </>
      )}

      {/* Edit mode */}
      {isEditing && (
        <form onSubmit={onSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { key: 'monthlyIncome',   label: 'Monthly Income (after taxes)', required: true },
              { key: 'monthlyExpenses', label: 'Monthly Expenses (estimated)',  required: true },
              { key: 'currentSavings',  label: 'Current Savings',               required: true },
              { key: 'debt',            label: 'Total Debt (if any)',           required: false },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    className="input-field pl-8"
                    value={form[f.key] ?? ''}
                    onChange={onChange(f.key)}
                    required={!!f.required}
                    placeholder="0"
                  />
                </div>
              </div>
            ))}
          </div>

          {toNumber(form.monthlyIncome) > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
              💡 Recommended monthly savings: ${Math.round(toNumber(form.monthlyIncome) * 0.2).toLocaleString()} (50/30/20 rule)
            </div>
          )}

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary flex items-center disabled:opacity-50">
              {saving ? <LoadingSpinner size="small" /> : (<><Save className="w-4 h-4 mr-2" /> Save</>)}
            </button>
            <button type="button" onClick={cancel} className="btn-secondary flex items-center">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};



// Goals Tab Component
const GoalsTab = ({ user }) => {
  const { saveOnboarding } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    riskTolerance: user?.onboarding?.riskTolerance || 'moderate',
    investmentExperience: user?.onboarding?.investmentExperience || 'some',
    investmentTimeline: user?.onboarding?.investmentTimeline || 'long',
  });

  const onChange = (key) => (e) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const cancel = () => {
    setForm({
      riskTolerance: user?.onboarding?.riskTolerance || 'moderate',
      investmentExperience: user?.onboarding?.investmentExperience || 'some',
      investmentTimeline: user?.onboarding?.investmentTimeline || 'long',
    });
    setIsEditing(false);
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await saveOnboarding({
        riskTolerance: form.riskTolerance,
        investmentExperience: form.investmentExperience,
        investmentTimeline: form.investmentTimeline,
      });
      if (res?.success) setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  // helpers for pretty labels
  const pretty = {
    risk: labelMap.risk[form.riskTolerance] || form.riskTolerance,
    xp: labelMap.experience[form.investmentExperience] || form.investmentExperience,
    timeline: labelMap.timeline[form.investmentTimeline] || form.investmentTimeline,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Goals & Preferences</h2>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="btn-secondary flex items-center">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </button>
        )}
      </div>

      {/* View mode */}
      {!isEditing && (
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Investment Preferences</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoPill label="Risk Tolerance" value={labelMap.risk[user?.onboarding?.riskTolerance] || 'Moderate'} />
              <InfoPill label="Experience Level" value={labelMap.experience[user?.onboarding?.investmentExperience] || 'Some Experience'} />
              <InfoPill label="Timeline" value={labelMap.timeline[user?.onboarding?.investmentTimeline] || 'Long-term'} />
              <InfoPill label="Primary Goal" value={(user?.onboarding?.primaryGoal || 'Build Wealth').replace('-', ' ')} />
            </div>
          </div>

          {/* Active Goals (still display-only for now) */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Active Goals</h4>
            <div className="space-y-3">
              {[
                { title: 'Emergency Fund', progress: 65, target: '$10,000' },
                { title: 'Vacation Savings', progress: 80, target: '$3,000' },
                { title: 'New Car Fund', progress: 30, target: '$25,000' }
              ].map((goal, i) => (
                <div key={i} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">{goal.title}</span>
                    <span className="text-sm text-gray-600">Target: {goal.target}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${goal.progress}%` }} />
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{goal.progress}% complete</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit mode */}
      {isEditing && (
        <form onSubmit={onSave} className="space-y-8">
          {/* Risk Tolerance */}
          <section>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Risk Tolerance
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: 'conservative', label: 'Conservative', desc: 'Stable, low risk' },
                { value: 'moderate', label: 'Moderate', desc: 'Balanced risk/return' },
                { value: 'aggressive', label: 'Aggressive', desc: 'High risk/high reward' },
              ].map(opt => (
                <label key={opt.value} className="p-3 border rounded-lg flex items-start space-x-3 cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="riskTolerance"
                    value={opt.value}
                    checked={form.riskTolerance === opt.value}
                    onChange={onChange('riskTolerance')}
                    className="mt-1 h-4 w-4 text-primary-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{opt.label}</div>
                    <div className="text-sm text-gray-500">{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Experience + Timeline */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Investment Experience</label>
              <select
                className="input-field"
                value={form.investmentExperience}
                onChange={onChange('investmentExperience')}
              >
                <option value="">Select level</option>
                <option value="beginner">Beginner (Never invested)</option>
                <option value="some">Some experience</option>
                <option value="experienced">Experienced</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Investment Timeline</label>
              <select
                className="input-field"
                value={form.investmentTimeline}
                onChange={onChange('investmentTimeline')}
              >
                <option value="">Select timeline</option>
                <option value="short">Short-term (1–3 years)</option>
                <option value="medium">Medium-term (3–10 years)</option>
                <option value="long">Long-term (10+ years)</option>
                <option value="retirement">Retirement</option>
              </select>
            </div>
          </section>

          {/* Actions */}
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary flex items-center disabled:opacity-50">
              {saving ? <LoadingSpinner size="small" /> : (<><Save className="w-4 h-4 mr-2" /> Save</>)}
            </button>
            <button type="button" onClick={cancel} className="btn-secondary flex items-center">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

/* Small display helper used above */
const InfoPill = ({ label, value }) => (
  <div className="p-3 bg-gray-50 rounded-lg">
    <span className="text-sm font-medium text-gray-700">{label}:</span>
    <span className="ml-2 text-sm text-gray-900">{value}</span>
  </div>
);

/* Pretty label maps */
const labelMap = {
  risk: {
    conservative: 'Conservative',
    moderate: 'Moderate',
    aggressive: 'Aggressive',
  },
  experience: {
    beginner: 'Beginner',
    some: 'Some Experience',
    experienced: 'Experienced',
    expert: 'Expert',
  },
  timeline: {
    short: 'Short-term',
    medium: 'Medium-term',
    long: 'Long-term',
    retirement: 'Retirement',
  },
};

// Notifications Tab Component
const NotificationsTab = ({ user }) => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Settings</h2>
    
    <div className="space-y-6">
      {[
        { key: 'goalReminders', label: 'Goal Progress Reminders', description: 'Weekly updates on your financial goals' },
        { key: 'budgetAlerts', label: 'Budget Alerts', description: 'Notifications when you exceed budget categories' },
        { key: 'savingsTips', label: 'AI Savings Tips', description: 'Personalized recommendations from your AI advisor' },
        { key: 'bettingUpdates', label: 'Challenge Updates', description: 'Updates on your financial challenges and competitions' },
        { key: 'marketNews', label: 'Market News', description: 'Important financial market updates and news' },
        { key: 'securityAlerts', label: 'Security Alerts', description: 'Account security and login notifications' }
      ].map((setting) => (
        <div key={setting.key} className="flex items-center justify-between py-3 border-b border-gray-200">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{setting.label}</h4>
            <p className="text-sm text-gray-600">{setting.description}</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              defaultChecked={user?.notifications?.[setting.key] !== false}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>
      ))}
    </div>
  </div>
);

// Security Tab Component
const SecurityTab = ({ user }) => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
    
    <div className="space-y-6">
      <div className="p-4 border border-gray-200 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Password</h4>
        <p className="text-sm text-gray-600 mb-3">
          Last changed: {new Date().toLocaleDateString()}
        </p>
        <button className="btn-secondary">Change Password</button>
      </div>

      <div className="p-4 border border-gray-200 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Two-Factor Authentication</h4>
        <p className="text-sm text-gray-600 mb-3">
          Add an extra layer of security to your account
        </p>
        <button className="btn-primary">Enable 2FA</button>
      </div>

      <div className="p-4 border border-gray-200 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Login History</h4>
        <div className="space-y-2">
          {[
            { location: 'San Francisco, CA', time: '2 minutes ago', current: true },
            { location: 'San Francisco, CA', time: '1 day ago', current: false },
            { location: 'New York, NY', time: '3 days ago', current: false }
          ].map((login, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span>{login.location}</span>
              <span className="text-gray-500">
                {login.time} {login.current && '(Current)'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Billing Tab Component
const BillingTab = ({ user }) => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 mb-6">Billing & Subscription</h2>
    
    <div className="space-y-6">
      <div className="p-4 border border-gray-200 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Current Plan</h4>
        <p className="text-sm text-gray-600 mb-3">Free Plan - All core features included</p>
        <button className="btn-primary">Upgrade to Pro</button>
      </div>

      <div className="p-4 border border-gray-200 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Payment Methods</h4>
        <p className="text-sm text-gray-600 mb-3">No payment methods on file</p>
        <button className="btn-secondary">Add Payment Method</button>
      </div>

      <div className="p-4 border border-gray-200 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Billing History</h4>
        <p className="text-sm text-gray-600">No billing history available</p>
      </div>
    </div>
  </div>
);

// Helper Components
const ProfileField = ({ icon: Icon, label, value }) => (
  <div className="flex items-center space-x-3">
    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
      <Icon className="w-4 h-4 text-gray-600" />
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <p className="text-sm text-gray-900">{value}</p>
    </div>
  </div>
);

/* helpers (put these near your other helpers in the file) */
function valueStr(n) {
  if (n === null || n === undefined) return '';
  return String(n);
}
function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function clampNonNeg(v) {
  const n = toNumber(v);
  return n < 0 ? 0 : n;
}

const FinancialMetricCard = ({ title, value, change }) => (
  <div className="p-4 border border-gray-200 rounded-lg">
    <h4 className="text-sm font-medium text-gray-600">{title}</h4>
    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    {change && (
      <p className={`text-sm mt-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
        {change > 0 ? '+' : ''}{change}% from last month
      </p>
    )}
  </div>
);

export default Profile;
