const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function quickTest() {
  console.log('🔬 Quick Integration System Test...\n');
  
  try {
    // 1. Test user creation and login
    console.log('1. Testing user login...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'integration-test@example.com',
      password: 'testpass123'
    }).catch(async () => {
      // If login fails, try to register
      await axios.post('http://localhost:3001/api/auth/register', {
        firstName: 'Test',
        lastName: 'User',
        email: 'integration-test@example.com',
        password: 'testpass123'
      });
      return await axios.post('http://localhost:3001/api/auth/login', {
        email: 'integration-test@example.com',
        password: 'testpass123'
      });
    });
    
    const token = loginResponse.data.token;
    console.log('✅ User authenticated');

    // 2. Test onboarding
    console.log('2. Testing onboarding...');
    await axios.post('http://localhost:3001/api/auth/onboarding', {
      age: 30,
      lifeStage: 'early-career',
      riskTolerance: 'moderate',
      primaryGoals: ['retirement', 'investment'],
      timeHorizon: '10+ years',
      monthlyIncome: 6000,
      monthlyExpenses: 4000,
      currentSavings: 20000,
      debt: 5000
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Onboarding completed');

    // 3. Test CSV creation and upload
    console.log('3. Testing CSV upload...');
    const testCSV = 'Date,Description,Category,Amount,Type\n2024-12-01,Test Transaction,Food,-50.00,expense\n2024-12-02,Salary,Income,2500.00,income';
    fs.writeFileSync('test_upload.csv', testCSV);
    
    const formData = new FormData();
    formData.append('csvFile', fs.createReadStream('test_upload.csv'));
    
    const uploadResponse = await axios.post(
      'http://localhost:3001/api/integrations/upload/paypal/spending',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${token}`
        }
      }
    );
    console.log('✅ CSV uploaded:', uploadResponse.data.recordsProcessed, 'records');

    // 4. Test user data retrieval
    console.log('4. Testing user data retrieval...');
    const userDataResponse = await axios.get('http://localhost:3001/api/integrations/user-data', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ User data retrieved:');
    console.log('   Connected:', userDataResponse.data.connected.length);
    console.log('   Net Worth:', userDataResponse.data.insights.totalNetWorth || 0);

    // 5. Test debug endpoint
    console.log('5. Testing debug endpoint...');
    const debugResponse = await axios.get('http://localhost:3001/api/debug/user-data', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Debug endpoint working, response length:', debugResponse.data.length);

    // Clean up
    if (fs.existsSync('test_upload.csv')) {
      fs.unlinkSync('test_upload.csv');
    }

    console.log('\n🎉 All tests passed! Integration system is working properly.');
    console.log('\n📋 To view all your data, visit: http://localhost:3001/api/debug/user-data');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

quickTest();