// Simple test to demonstrate AI advisor with your Google API key
const test = async () => {
  const axios = require('axios');
  
  console.log('🚀 Testing AI Financial Advisor with Google AI');
  console.log('================================================\n');
  
  try {
    // Register a test user
    const email = `test_${Date.now()}@demo.com`;
    console.log('1. Creating test user...');
    
    const registerRes = await axios.post('http://localhost:3002/api/auth/register', {
      email, password: 'test123', firstName: 'Demo', lastName: 'User'
    });
    
    const token = registerRes.data.token;
    console.log('✅ User registered\n');
    
    // Complete onboarding
    console.log('2. Completing onboarding...');
    await axios.post('http://localhost:3002/api/auth/onboarding', {
      age: '26-35',
      lifeStage: 'single',
      primaryGoal: 'save-emergency',
      riskTolerance: 'moderate',
      monthlyIncome: 4000,
      monthlyExpenses: 2800,
      currentSavings: 5000,
      debt: 15000
    }, { headers: { Authorization: `Bearer ${token}` } });
    
    console.log('✅ Onboarding complete\n');
    
    // Test AI Chat
    console.log('3. Testing AI Financial Advisor...');
    console.log('💬 Question: "How can I pay off my $15,000 debt faster?"');
    
    const chatRes = await axios.post('http://localhost:3002/api/advisor/chat', {
      message: "I have $15,000 in debt and make $4,000/month. How can I pay this off faster while still saving money?"
    }, { headers: { Authorization: `Bearer ${token}` } });
    
    console.log('\n🤖 AI Response:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(chatRes.data.response.substring(0, 300) + '...');
    console.log('\n💡 Key Insights:');
    chatRes.data.insights?.forEach((insight, i) => {
      console.log(`   ${i + 1}. ${insight}`);
    });
    
    console.log('\n🎯 Suggested Actions:');
    chatRes.data.suggestions?.forEach((suggestion, i) => {
      console.log(`   ${i + 1}. ${suggestion.title}: ${suggestion.description}`);
    });
    
    console.log(`\n🔧 Powered by: ${chatRes.data.provider}`);
    console.log('\n✅ AI Financial Advisor is working perfectly!');
    console.log('🎉 Your users will get personalized, intelligent financial advice!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
};

test();
