const axios = require('axios');

// Configure axios defaults
axios.defaults.timeout = 10000;
axios.defaults.validateStatus = function (status) {
  return status < 500; // Accept any status code less than 500
};

// Test data that matches what the frontend sends
const testOnboardingData = {
  age: '26-35',
  lifeStage: 'single',
  primaryGoal: 'save-emergency',
  riskTolerance: 'moderate',
  monthlyIncome: 5000,
  monthlyExpenses: 3500,
  currentSavings: 10000,
  debt: 2000,
  investmentExperience: 'some',
  investmentTimeline: 'medium',
  notifications: {
    goalReminders: true,
    budgetAlerts: true,
    savingsTips: true,
    bettingUpdates: false
  },
  communicationMethod: 'email'
};

// Generate a unique email for testing
const testEmail = `test_${Date.now()}@example.com`;

// Test user registration and onboarding
const testOnboarding = async () => {
  try {
    console.log('🔄 Testing onboarding flow...');
    
    // Test health endpoint first
    console.log('🏥 Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:3002/api/health');
    console.log('✅ Server is healthy:', healthResponse.data.message);
    
    // First register a test user
    console.log('📝 Registering test user with email:', testEmail);
    const registerResponse = await axios.post('http://localhost:3002/api/auth/register', {
      email: testEmail,
      password: 'testpass123',
      firstName: 'Test',
      lastName: 'User'
    });
    
    if (registerResponse.status !== 201) {
      throw new Error(`Registration failed with status ${registerResponse.status}: ${registerResponse.data.message}`);
    }
    
    const token = registerResponse.data.token;
    console.log('✅ User registered successfully');
    console.log('🔑 Received token:', token ? 'Yes' : 'No');
    
    // Now test onboarding
    console.log('🎯 Testing onboarding with data:', JSON.stringify(testOnboardingData, null, 2));
    const onboardingResponse = await axios.post(
      'http://localhost:3002/api/auth/onboarding',
      testOnboardingData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (onboardingResponse.status !== 200) {
      throw new Error(`Onboarding failed with status ${onboardingResponse.status}: ${onboardingResponse.data.message}`);
    }
    
    console.log('✅ Onboarding completed successfully!');
    console.log('📊 User data after onboarding:');
    console.log('- Name:', onboardingResponse.data.user.firstName, onboardingResponse.data.user.lastName);
    console.log('- Onboarding Complete:', onboardingResponse.data.user.onboardingComplete);
    console.log('- Monthly Income:', onboardingResponse.data.user.financialProfile?.monthlyIncome);
    console.log('- Risk Tolerance:', onboardingResponse.data.user.onboarding?.riskTolerance);
    console.log('- Points:', onboardingResponse.data.user.gamification?.points);
    
  } catch (error) {
    console.error('❌ Error during onboarding test:');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🔌 Connection refused - make sure the server is running on port 3002');
    } else if (error.code === 'ECONNRESET') {
      console.error('🔌 Connection reset - server may have crashed');
    } else if (error.code === 'ENOTFOUND') {
      console.error('🔌 Host not found - check if localhost is accessible');
    } else if (error.response) {
      console.error('📊 HTTP Error Details:');
      console.error('- Status:', error.response.status);
      console.error('- Status Text:', error.response.statusText);
      console.error('- Message:', error.response.data?.message);
      console.error('- Details:', error.response.data?.details);
      console.error('- Full Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('🚫 Network/Other Error:', error.message);
      console.error('Error Code:', error.code);
    }
    
    process.exit(1);
  }
};

// Run the test
console.log('🚀 Starting onboarding test...');
testOnboarding().then(() => {
  console.log('🎉 Test completed successfully!');
  process.exit(0);
});
