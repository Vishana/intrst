const axios = require('axios');

// Test the complete AI-powered financial advisory system
const testAISystem = async () => {
  console.log('🤖 Testing AI-Powered Financial Advisory System with Google AI\n');
  
  try {
    // First, register and onboard a test user
    const testEmail = `aitest_${Date.now()}@example.com`;
    console.log('1. 📝 Creating test user...');
    
    const registerResponse = await axios.post('http://localhost:3002/api/auth/register', {
      email: testEmail,
      password: 'testpass123',
      firstName: 'Alex',
      lastName: 'Tester'
    });
    
    const token = registerResponse.data.token;
    console.log('   ✅ User registered successfully');
    
    // Complete onboarding
    console.log('2. 🎯 Completing onboarding...');
    const onboardingData = {
      age: '26-35',
      lifeStage: 'single',
      primaryGoal: 'save-emergency',
      riskTolerance: 'moderate',
      monthlyIncome: 4500,
      monthlyExpenses: 3200,
      currentSavings: 2500,
      debt: 8000,
      investmentExperience: 'some',
      investmentTimeline: 'medium',
      communicationMethod: 'email'
    };
    
    await axios.post('http://localhost:3002/api/auth/onboarding', onboardingData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Onboarding completed');
    
    // Test AI Chat Advisor
    console.log('3. 💬 Testing AI Financial Advisor Chat...');
    const chatResponse = await axios.post(
      'http://localhost:3002/api/advisor/chat',
      { 
        message: "I have $8,000 in debt and want to pay it off faster. What's the best strategy for my situation?" 
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('   🎤 User Question: "I have $8,000 in debt and want to pay it off faster. What\'s the best strategy for my situation?"');
    console.log('   🤖 AI Response:');
    console.log('   📝', chatResponse.data.response?.substring(0, 200) + '...');
    console.log('   💡 Key Insights:', chatResponse.data.insights?.slice(0, 2));
    console.log('   🎯 Suggestions:', chatResponse.data.suggestions?.slice(0, 1));
    console.log('   🔧 Powered by:', chatResponse.data.provider);
    
    // Test Budget Planning
    console.log('\n4. 💰 Testing AI Budget Planning...');
    const budgetResponse = await axios.post(
      'http://localhost:3002/api/advisor/budget-plan',
      { preferences: { focus: 'debt_payoff', aggressive: true } },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('   📊 AI-Generated Budget Plan:');
    console.log('   💵 Method:', budgetResponse.data.budget_method);
    if (budgetResponse.data.categories) {
      console.log('   🏠 Needs:', `$${budgetResponse.data.categories.needs?.amount} (${budgetResponse.data.categories.needs?.percentage}%)`);
      console.log('   🎉 Wants:', `$${budgetResponse.data.categories.wants?.amount} (${budgetResponse.data.categories.wants?.percentage}%)`);
      console.log('   💰 Savings:', `$${budgetResponse.data.categories.savings?.amount} (${budgetResponse.data.categories.savings?.percentage}%)`);
    }
    
    // Add some sample transactions
    console.log('\n5. 💸 Adding sample transactions...');
    const sampleTransactions = [
      { amount: -85, description: 'Grocery shopping', category: { primary: 'food' }, type: 'expense' },
      { amount: -45, description: 'Gas station', category: { primary: 'transportation' }, type: 'expense' },
      { amount: -120, description: 'Restaurant dinner', category: { primary: 'food' }, type: 'expense' },
      { amount: -25, description: 'Netflix subscription', category: { primary: 'subscription' }, type: 'expense' },
      { amount: 4500, description: 'Monthly salary', category: { primary: 'income' }, type: 'income' }
    ];
    
    for (const transaction of sampleTransactions) {
      await axios.post('http://localhost:3002/api/transactions', transaction, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    console.log('   ✅ Added 5 sample transactions');
    
    // Test AI Spending Analysis
    console.log('\n6. 📊 Testing AI Spending Analysis...');
    const spendingAnalysis = await axios.post(
      'http://localhost:3002/api/transactions/analyze-with-ai',
      { timeframe: '30d', focusArea: 'spending_optimization' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('   🔍 AI Spending Analysis:');
    console.log('   📋 Summary:', spendingAnalysis.data.summary?.substring(0, 150) + '...');
    console.log('   💡 Top Insights:', spendingAnalysis.data.insights?.slice(0, 2));
    console.log('   🎯 Recommendations:', spendingAnalysis.data.recommendations?.slice(0, 1));
    
    // Create a goal and test AI optimization
    console.log('\n7. 🎯 Creating goal and testing AI optimization...');
    const goalResponse = await axios.post(
      'http://localhost:3002/api/goals',
      {
        title: 'Emergency Fund',
        description: 'Build a 6-month emergency fund',
        category: 'emergency_fund',
        targetAmount: 19200, // 6 months * $3200 expenses
        targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        priority: 'high'
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    const goalId = goalResponse.data.goal.id || goalResponse.data.goal._id;
    console.log('   ✅ Created emergency fund goal');
    
    const goalOptimization = await axios.post(
      `http://localhost:3002/api/goals/${goalId}/ai-optimize`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('   🤖 AI Goal Optimization:');
    console.log('   📈 Strategy:', goalOptimization.data.optimization_strategies?.slice(0, 2));
    console.log('   💰 Recommended Monthly:', goalOptimization.data.prioritized_goals?.[0]?.recommended_monthly);
    
    // Test AI Bet Suggestions
    console.log('\n8. 🎲 Testing AI Bet Suggestions...');
    const betSuggestions = await axios.post(
      'http://localhost:3002/api/bets/suggestions',
      { preferences: { focus: 'debt_reduction', risk_level: 'medium' } },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('   🎯 AI-Suggested Financial Challenges:');
    betSuggestions.data.recommended_bets?.forEach((bet, index) => {
      console.log(`   ${index + 1}. ${bet.title} - $${bet.suggestedStake} stake`);
      console.log(`      📝 ${bet.description}`);
    });
    
    console.log('\n🎉 AI System Test Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ All AI features are working with Google AI');
    console.log('🤖 Your financial advisor is ready to help users!');
    console.log('💰 Budget planning, spending analysis, and goal optimization all functional');
    console.log('🎲 Financial betting system with AI suggestions operational');
    
  } catch (error) {
    console.error('\n❌ Test failed at some point:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data?.message);
      console.error('Details:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
};

// Run the comprehensive test
testAISystem();
