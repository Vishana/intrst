// Test script to verify AI Advisor functionality
const aiAdvisor = require('./services/aiAdvisor');

// Mock user profile for testing
const mockUser = {
  firstName: 'John',
  lastName: 'Doe',
  onboarding: {
    age: '26-35',
    lifeStage: 'single',
    riskTolerance: 'moderate',
    primaryGoals: ['save-emergency', 'invest-retirement']
  },
  financialProfile: {
    monthlyIncome: 5000,
    monthlyExpenses: 3500,
    currentSavings: 8000,
    debt: 2000
  },
  calculateNetWorth: () => 6000
};

async function testAIAdvisor() {
  console.log('🤖 Testing AI Financial Advisor...\n');
  
  try {
    console.log('Testing model initialization...');
    
    // Test basic advice generation
    const response = await aiAdvisor.generateFinancialAdvice(
      "How can I save more money each month?",
      mockUser
    );
    
    console.log('✅ AI Advisor Response:');
    console.log('📝 Response:', response.response);
    console.log('💡 Insights:', response.insights);
    console.log('🎯 Suggestions:', response.suggestions);
    console.log('🔧 Provider:', response.provider);
    
  } catch (error) {
    console.log('❌ AI Advisor Test Failed:');
    console.log('Error:', error.message);
    
    if (error.message.includes('No AI models available')) {
      console.log('\n🔑 API Key Required!');
      console.log('Please add one of these to your .env file:');
      console.log('- OPENAI_API_KEY=sk-...');
      console.log('- GOOGLE_API_KEY=AIza...');
      console.log('- ANTHROPIC_API_KEY=sk-ant-...');
    }
  }
}

// Run the test
testAIAdvisor();
