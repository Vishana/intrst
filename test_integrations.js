const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Test integration functionality
async function testIntegrations() {
  console.log('🧪 Testing Financial Integrations System...\n');
  
  try {
    // Test 1: Check if the backend is running
    console.log('1. Testing backend health...');
    const healthResponse = await axios.get('http://localhost:3001/api/health');
    console.log('✅ Backend is running:', healthResponse.data.message);
    
    // Test 2: Test sample CSV download
    console.log('\n2. Testing sample CSV download...');
    const csvResponse = await axios.get('http://localhost:3001/api/integrations/sample-csv/retirement');
    console.log('✅ Sample CSV download works, size:', csvResponse.data.length, 'characters');
    
    // Test 3: Check available integration types
    console.log('\n3. Testing available integration types...');
    const typesResponse = await axios.get('http://localhost:3001/api/integrations/available-types');
    console.log('✅ Available integration types:', typesResponse.data.types.length);
    typesResponse.data.types.forEach(type => {
      console.log(`   - ${type.type}: ${type.sampleCount} sample records`);
    });
    
    // Test 4: Create a test user and login (for authenticated endpoints)
    console.log('\n4. Creating test user for integration testing...');
    
    const testUser = {
      firstName: 'Test',
      lastName: 'Integration',
      email: 'test-integration@example.com',
      password: 'testpass123'
    };
    
    try {
      // Try to register
      const registerResponse = await axios.post('http://localhost:3001/api/auth/register', testUser);
      console.log('✅ Test user created');
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message?.includes('already exists')) {
        console.log('ℹ️  Test user already exists, proceeding with login...');
      } else {
        throw error;
      }
    }
    
    // Login to get token
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: testUser.email,
      password: testUser.password
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Test user logged in successfully');
    
    // Test 5: Test user integration data endpoint
    console.log('\n5. Testing user integration data endpoint...');
    const userDataResponse = await axios.get('http://localhost:3001/api/integrations/user-data', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ User integration data retrieved:', {
      connected: userDataResponse.data.connected.length,
      insights: Object.keys(userDataResponse.data.insights).length
    });
    
    // Test 6: Test CSV parsing with a sample file
    console.log('\n6. Testing CSV file upload and parsing...');
    
    // Check if sample file exists
    const sampleFilePath = path.join(__dirname, 'public', 'sample-data', 'fidelity_retirement_sample.csv');
    if (fs.existsSync(sampleFilePath)) {
      const formData = new FormData();
      formData.append('csvFile', fs.createReadStream(sampleFilePath));
      
      try {
        const uploadResponse = await axios.post(
          'http://localhost:3001/api/integrations/upload/fidelity/retirement',
          formData,
          {
            headers: {
              ...formData.getHeaders(),
              Authorization: `Bearer ${token}`
            }
          }
        );
        console.log('✅ CSV upload successful:', {
          provider: uploadResponse.data.provider,
          type: uploadResponse.data.type,
          recordsProcessed: uploadResponse.data.recordsProcessed
        });
        
        // Check updated user data
        const updatedUserData = await axios.get('http://localhost:3001/api/integrations/user-data', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ User data updated after integration:', {
          connected: updatedUserData.data.connected.length,
          netWorth: updatedUserData.data.insights.totalNetWorth,
          investments: updatedUserData.data.insights.totalInvestments
        });
        
      } catch (uploadError) {
        console.log('❌ CSV upload failed:', uploadError.response?.data?.message || uploadError.message);
      }
    } else {
      console.log('⚠️  Sample CSV file not found, skipping upload test');
    }
    
    console.log('\n🎉 Integration system testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testIntegrations();
