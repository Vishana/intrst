import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  ArrowRight, 
  ArrowLeft, 
  DollarSign, 
  TrendingUp,
  Target,
  Shield,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { completeOnboarding } = useAuth();
  const totalSteps = 4;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await completeOnboarding(data);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{backgroundColor: '#E2DBAD'}}>
      <div className="max-w-md w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-black font-body">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-black font-body">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>
          
          <div className="w-full border-2 border-black rounded-full h-4" style={{backgroundColor: '#98B8D6'}}>
            <div
              className="bg-black h-full rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Onboarding Card */}
        <div className="border-2 border-black rounded-lg p-6" style={{backgroundColor: '#CED697'}}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {currentStep === 1 && (
              <Step1 register={register} errors={errors} />
            )}
            {currentStep === 2 && (
              <Step2 register={register} errors={errors} watch={watch} />
            )}
            {currentStep === 3 && (
              <Step3 register={register} errors={errors} />
            )}
            {currentStep === 4 && (
              <Step4 register={register} errors={errors} />
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-4 border-t-2 border-black">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center px-4 py-2 text-sm font-body text-black hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-black rounded-lg bg-white hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center px-4 py-2 border-2 border-black rounded-lg font-medium text-white bg-black hover:bg-gray-800 transition-colors font-body"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center disabled:opacity-50 px-4 py-2 border-2 border-black rounded-lg font-medium text-white bg-black hover:bg-gray-800 transition-colors font-body"
                >
                  {isLoading ? (
                    <LoadingSpinner size="small" />
                  ) : (
                    <>
                      Get Started
                      <CheckCircle className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Step 1: Personal Information
const Step1 = ({ register, errors }) => (
  <div className="space-y-6">
    <div className="text-center">
      <div className="w-12 h-12 border-2 border-black rounded-full flex items-center justify-center mx-auto mb-4" style={{backgroundColor: '#98B8D6'}}>
        <DollarSign className="w-6 h-6 text-black" />
      </div>
      <h2 className="text-2xl font-bold text-black font-body">
        Let's get to know you
      </h2>
      <p className="text-black mt-2 font-body">
        Tell us about yourself so we can personalize your experience
      </p>
    </div>

    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-black mb-1 font-body">
          What's your age?
        </label>
        <select
          {...register('age', { required: 'Age is required' })}
          className={`w-full px-3 py-2 text-sm border-2 border-black rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-black text-black bg-white ${errors.age ? 'border-red-500' : ''}`}
        >
          <option value="">Select your age range</option>
          <option value="18-25">18-25</option>
          <option value="26-35">26-35</option>
          <option value="36-45">36-45</option>
          <option value="46-55">46-55</option>
          <option value="56-65">56-65</option>
          <option value="65+">65+</option>
        </select>
        {errors.age && (
          <p className="mt-1 text-sm text-red-600 font-body">{errors.age.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-1 font-body">
          What's your current life stage?
        </label>
        <select
          {...register('lifeStage', { required: 'Life stage is required' })}
          className={`w-full px-3 py-2 text-sm border-2 border-black rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-black text-black bg-white ${errors.lifeStage ? 'border-red-500' : ''}`}
        >
          <option value="">Select your life stage</option>
          <option value="student">Student</option>
          <option value="single">Single Professional</option>
          <option value="couple">Couple (No Kids)</option>
          <option value="family">Family (With Kids)</option>
          <option value="near-retirement">Near Retirement</option>
          <option value="retired">Retired</option>
        </select>
        {errors.lifeStage && (
          <p className="mt-1 text-sm text-red-600 font-body">{errors.lifeStage.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-1 font-body">
          What's your primary financial goal?
        </label>
        <select
          {...register('primaryGoal', { required: 'Primary goal is required' })}
          className={`w-full px-3 py-2 text-sm border-2 border-black rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-black text-black bg-white ${errors.primaryGoal ? 'border-red-500' : ''}`}
        >
          <option value="">Select your main goal</option>
          <option value="save-emergency">Build Emergency Fund</option>
          <option value="pay-debt">Pay Off Debt</option>
          <option value="save-purchase">Save for Major Purchase</option>
          <option value="invest-retirement">Invest for Retirement</option>
          <option value="invest-wealth">Build Long-term Wealth</option>
          <option value="budget-control">Better Budget Control</option>
          <option value="other">Other</option>
        </select>
        {errors.primaryGoal && (
          <p className="mt-1 text-sm text-red-600 font-body">{errors.primaryGoal.message}</p>
        )}
      </div>
    </div>
  </div>
);

// Step 2: Financial Profile
const Step2 = ({ register, errors, watch }) => {
  const monthlyIncome = watch('monthlyIncome');
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-black rounded-full flex items-center justify-center mx-auto mb-4" style={{backgroundColor: '#E2DBAD'}}>
          <TrendingUp className="w-6 h-6 text-black" />
        </div>
        <h2 className="text-2xl font-bold text-black font-body">
          Your Financial Picture
        </h2>
        <p className="text-black mt-2 font-body">
          Help us understand your current financial situation
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-black mb-1 font-body">
            Monthly Income (after taxes)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-600">$</span>
            </div>
            <input
              {...register('monthlyIncome', { 
                required: 'Monthly income is required',
                min: { value: 0, message: 'Income must be positive' }
              })}
              type="number"
              className={`w-full pl-8 px-3 py-2 text-sm border-2 border-black rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-black text-black bg-white ${errors.monthlyIncome ? 'border-red-500' : ''}`}
              placeholder="4,500"
            />
          </div>
          {errors.monthlyIncome && (
            <p className="mt-1 text-sm text-red-600 font-body">{errors.monthlyIncome.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1 font-body">
            Monthly Expenses (estimated)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-600">$</span>
            </div>
            <input
              {...register('monthlyExpenses', { 
                required: 'Monthly expenses is required',
                min: { value: 0, message: 'Expenses must be positive' }
              })}
              type="number"
              className={`w-full pl-8 px-3 py-2 text-sm border-2 border-black rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-black text-black bg-white ${errors.monthlyExpenses ? 'border-red-500' : ''}`}
              placeholder="3,200"
            />
          </div>
          {errors.monthlyExpenses && (
            <p className="mt-1 text-sm text-red-600 font-body">{errors.monthlyExpenses.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1 font-body">
            Current Savings
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-600">$</span>
            </div>
            <input
              {...register('currentSavings', { 
                required: 'Current savings is required',
                min: { value: 0, message: 'Savings must be positive' }
              })}
              type="number"
              className={`w-full pl-8 px-3 py-2 text-sm border-2 border-black rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-black text-black bg-white ${errors.currentSavings ? 'border-red-500' : ''}`}
              placeholder="5,000"
            />
          </div>
          {errors.currentSavings && (
            <p className="mt-1 text-sm text-red-600 font-body">{errors.currentSavings.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1 font-body">
            Total Debt (if any)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-600">$</span>
            </div>
            <input
              {...register('debt', { 
                min: { value: 0, message: 'Debt must be positive' }
              })}
              type="number"
              className={`w-full pl-8 px-3 py-2 text-sm border-2 border-black rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-black text-black bg-white ${errors.debt ? 'border-red-500' : ''}`}
              placeholder="0"
            />
          </div>
          {errors.debt && (
            <p className="mt-1 text-sm text-red-600 font-body">{errors.debt.message}</p>
          )}
        </div>

        {/* Quick calculation */}
        {monthlyIncome && (
          <div className="p-3 border-2 border-black rounded-lg text-sm text-black font-body" style={{backgroundColor: '#98B8D6'}}>
            <p>💡 Recommended monthly savings: ${Math.round(monthlyIncome * 0.2).toLocaleString()}</p>
            <p className="text-xs mt-1">Based on the 50/30/20 rule</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Step 3: Investment Preferences
const Step3 = ({ register, errors }) => (
  <div className="space-y-6">
    <div className="text-center">
      <div className="w-12 h-12 border-2 border-black rounded-full flex items-center justify-center mx-auto mb-4" style={{backgroundColor: '#CED697'}}>
        <Target className="w-6 h-6 text-black" />
      </div>
      <h2 className="text-2xl font-bold text-black font-body">
        Investment Preferences
      </h2>
      <p className="text-black mt-2 font-body">
        Let us know your investment style and risk tolerance
      </p>
    </div>

    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-black mb-3 font-body">
          What's your risk tolerance?
        </label>
        <div className="space-y-2">
          {[
            { value: 'conservative', label: 'Conservative', desc: 'Prefer stable, low-risk investments' },
            { value: 'moderate', label: 'Moderate', desc: 'Balanced approach to risk and return' },
            { value: 'aggressive', label: 'Aggressive', desc: 'Comfortable with high-risk, high-reward' }
          ].map((option) => (
            <label key={option.value} className="flex items-start space-x-3 p-3 border-2 border-black rounded-lg hover:bg-gray-50 cursor-pointer bg-white">
              <input
                {...register('riskTolerance', { required: 'Risk tolerance is required' })}
                type="radio"
                value={option.value}
                className="mt-1 h-4 w-4 text-black focus:ring-black border-2 border-black"
              />
              <div className="flex-1">
                <div className="font-medium text-black font-body">{option.label}</div>
                <div className="text-sm text-gray-700 font-body">{option.desc}</div>
              </div>
            </label>
          ))}
        </div>
        {errors.riskTolerance && (
          <p className="mt-1 text-sm text-red-600 font-body">{errors.riskTolerance.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-1 font-body">
          Investment experience level
        </label>
        <select
          {...register('investmentExperience', { required: 'Investment experience is required' })}
          className={`w-full px-3 py-2 text-sm border-2 border-black rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-black text-black bg-white ${errors.investmentExperience ? 'border-red-500' : ''}`}
        >
          <option value="">Select your experience level</option>
          <option value="beginner">Beginner (Never invested before)</option>
          <option value="some">Some experience (Basic knowledge)</option>
          <option value="experienced">Experienced (Regular investor)</option>
          <option value="expert">Expert (Advanced strategies)</option>
        </select>
        {errors.investmentExperience && (
          <p className="mt-1 text-sm text-red-600 font-body">{errors.investmentExperience.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-1 font-body">
          Investment timeline
        </label>
        <select
          {...register('investmentTimeline', { required: 'Investment timeline is required' })}
          className={`w-full px-3 py-2 text-sm border-2 border-black rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-black text-black bg-white ${errors.investmentTimeline ? 'border-red-500' : ''}`}
        >
          <option value="">When will you need the money?</option>
          <option value="short">Short-term (1-3 years)</option>
          <option value="medium">Medium-term (3-10 years)</option>
          <option value="long">Long-term (10+ years)</option>
          <option value="retirement">Retirement planning</option>
        </select>
        {errors.investmentTimeline && (
          <p className="mt-1 text-sm text-red-600 font-body">{errors.investmentTimeline.message}</p>
        )}
      </div>
    </div>
  </div>
);

// Step 4: Notifications & Preferences
const Step4 = ({ register, errors }) => (
  <div className="space-y-6">
    <div className="text-center">
      <div className="w-12 h-12 border-2 border-black rounded-full flex items-center justify-center mx-auto mb-4" style={{backgroundColor: '#E2DBAD'}}>
        <Shield className="w-6 h-6 text-black" />
      </div>
      <h2 className="text-2xl font-bold text-black font-body">
        Final Preferences
      </h2>
      <p className="text-black mt-2 font-body">
        Customize your notifications and account preferences
      </p>
    </div>

    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-black mb-3 font-body">
          Notification Preferences
        </label>
        <div className="space-y-3">
          {[
            { 
              key: 'goalReminders', 
              label: 'Goal Progress Reminders',
              desc: 'Weekly updates on your financial goals'
            },
            { 
              key: 'budgetAlerts', 
              label: 'Budget Alerts',
              desc: 'Notifications when you exceed budget categories'
            },
            { 
              key: 'savingsTips', 
              label: 'AI Savings Tips',
              desc: 'Personalized recommendations from your AI advisor'
            },
            { 
              key: 'bettingUpdates', 
              label: 'Betting Challenge Updates',
              desc: 'Updates on your financial challenges and competitions'
            }
          ].map((pref) => (
            <label key={pref.key} className="flex items-start space-x-3">
              <input
                {...register(`notifications.${pref.key}`)}
                type="checkbox"
                defaultChecked
                className="mt-1 h-4 w-4 text-black focus:ring-black border-2 border-black rounded"
              />
              <div className="flex-1">
                <div className="font-medium text-black font-body">{pref.label}</div>
                <div className="text-sm text-gray-700 font-body">{pref.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-1 font-body">
          Preferred Communication Method
        </label>
        <select
          {...register('communicationMethod', { required: 'Communication method is required' })}
          className={`w-full px-3 py-2 text-sm border-2 border-black rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-black text-black bg-white ${errors.communicationMethod ? 'border-red-500' : ''}`}
        >
          <option value="">Select preferred method</option>
          <option value="email">Email</option>
          <option value="sms">Text Messages</option>
          <option value="push">Push Notifications</option>
          <option value="minimal">Minimal Notifications</option>
        </select>
        {errors.communicationMethod && (
          <p className="mt-1 text-sm text-red-600 font-body">{errors.communicationMethod.message}</p>
        )}
      </div>

      <div className="p-4 border-2 border-black rounded-lg" style={{backgroundColor: '#98B8D6'}}>
        <div className="flex items-start space-x-2">
          <CheckCircle className="w-5 h-5 text-black mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-black mb-1 font-body">
              You're all set! 🎉
            </h4>
            <p className="text-sm text-black font-body">
              We'll use this information to personalize your financial experience and provide tailored advice through your AI advisor.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Onboarding;
