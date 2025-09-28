const mongoose = require('mongoose');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Goal = require('./models/Goal');
const DatabaseService = require('./services/dataService');
const aiAdvisor = require('./services/aiAdvisor');
require('dotenv').config();

/**
 * Comprehensive test suite for AI Advisor MongoDB integration
 * Tests the complete flow from database to visualization
 */

class AIAdvisorIntegrationTest {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: []
    };
    this.testUserId = null;
  }

  async runAllTests() {
    console.log('\n🧪 STARTING COMPREHENSIVE AI ADVISOR INTEGRATION TESTS\n');
    console.log('='.repeat(60));
    
    try {
      // Connect to test database
      await this.connectToDatabase();
      
      // Create test user with real data
      await this.createTestUser();
      
      // Test database service
      await this.testDatabaseService();
      
      // Test AI advisor with real data
      await this.testAIAdvisorIntegration();
      
      // Test chart data formatting
      await this.testChartDataFormatting();
      
      // Test visualization saving
      await this.testVisualizationSaving();
      
      // Cleanup test data
      await this.cleanup();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
      this.recordError(error);
    } finally {
      await this.disconnectDatabase();
      this.printResults();
    }
  }

  async connectToDatabase() {
    console.log('🔌 Connecting to test database...');
    
    if (mongoose.connection.readyState === 0) {
      const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/intrst-test';
      await mongoose.connect(mongoURI);
      console.log('✅ Connected to test database');
    } else {
      console.log('✅ Already connected to database');
    }
  }

  async disconnectDatabase() {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from database');
    }
  }

  async createTestUser() {
    console.log('\n📝 Creating test user with comprehensive financial data...');
    
    try {
      // Clean up any existing test user
      await User.deleteMany({ email: 'test-ai-advisor@example.com' });
      await Transaction.deleteMany({ userId: { $exists: false } });
      await Goal.deleteMany({ userId: { $exists: false } });
      
      // Create test user
      const testUser = new User({
        email: 'test-ai-advisor@example.com',
        password: 'testpassword123',
        firstName: 'AI',
        lastName: 'Tester',
        onboarding: {
          isComplete: true,
          lifeStage: 'early-career',
          age: '28',
          income: 75000,
          primaryGoals: ['save-emergency', 'invest-retirement'],
          riskTolerance: 'moderate',
          investmentExperience: 'some',
          investmentTimeline: 'long',
          communicationMethod: 'email'
        },
        financialProfile: {
          currentSavings: 25000,
          monthlyIncome: 6250,
          monthlyExpenses: 4800,
          debt: 15000,
          creditScore: 720
        }
      });
      
      const savedUser = await testUser.save();
      this.testUserId = savedUser._id;
      console.log('✅ Test user created:', savedUser.email);
      
      // Create test transactions
      await this.createTestTransactions();
      
      // Create test goals
      await this.createTestGoals();
      
      this.recordPass('Test user creation');
      
    } catch (error) {
      console.error('❌ Failed to create test user:', error.message);
      this.recordError(error);
      throw error;
    }
  }

  async createTestTransactions() {
    console.log('💳 Creating test transactions...');
    
    const transactions = [
      // Income transactions
      {
        userId: this.testUserId,
        amount: 6250,
        description: 'Monthly Salary',
        date: new Date('2024-01-15'),
        category: { primary: 'income' },
        type: 'income',
        source: 'manual'
      },
      {
        userId: this.testUserId,
        amount: 6250,
        description: 'Monthly Salary',
        date: new Date('2024-02-15'),
        category: { primary: 'income' },
        type: 'income',
        source: 'manual'
      },
      // Expense transactions
      {
        userId: this.testUserId,
        amount: -1800,
        description: 'Rent Payment',
        date: new Date('2024-01-01'),
        category: { primary: 'housing' },
        type: 'expense',
        source: 'manual'
      },
      {
        userId: this.testUserId,
        amount: -1800,
        description: 'Rent Payment',
        date: new Date('2024-02-01'),
        category: { primary: 'housing' },
        type: 'expense',
        source: 'manual'
      },
      {
        userId: this.testUserId,
        amount: -450,
        description: 'Grocery Shopping',
        date: new Date('2024-01-05'),
        category: { primary: 'food' },
        type: 'expense',
        source: 'manual'
      },
      {
        userId: this.testUserId,
        amount: -300,
        description: 'Gas and Transportation',
        date: new Date('2024-01-08'),
        category: { primary: 'transportation' },
        type: 'expense',
        source: 'manual'
      },
      {
        userId: this.testUserId,
        amount: -120,
        description: 'Utilities',
        date: new Date('2024-01-10'),
        category: { primary: 'utilities' },
        type: 'expense',
        source: 'manual'
      },
      {
        userId: this.testUserId,
        amount: -80,
        description: 'Netflix, Spotify',
        date: new Date('2024-01-12'),
        category: { primary: 'subscription' },
        type: 'expense',
        source: 'manual'
      },
      {
        userId: this.testUserId,
        amount: -200,
        description: 'Dinner and Entertainment',
        date: new Date('2024-01-15'),
        category: { primary: 'entertainment' },
        type: 'expense',
        source: 'manual'
      },
      {
        userId: this.testUserId,
        amount: -150,
        description: 'Clothing Purchase',
        date: new Date('2024-01-18'),
        category: { primary: 'shopping' },
        type: 'expense',
        source: 'manual'
      }
    ];
    
    const savedTransactions = await Transaction.insertMany(transactions);
    console.log(`✅ Created ${savedTransactions.length} test transactions`);
  }

  async createTestGoals() {
    console.log('🎯 Creating test goals...');
    
    const goals = [
      {
        userId: this.testUserId,
        title: 'Emergency Fund',
        description: '6 months of expenses saved',
        category: 'emergency_fund',
        targetAmount: 30000,
        currentAmount: 5000,
        targetDate: new Date('2024-12-31'),
        status: 'active',
        priority: 'high'
      },
      {
        userId: this.testUserId,
        title: 'Vacation to Japan',
        description: 'Trip planned for next summer',
        category: 'savings',
        targetAmount: 8000,
        currentAmount: 1200,
        targetDate: new Date('2024-08-01'),
        status: 'active',
        priority: 'medium'
      },
      {
        userId: this.testUserId,
        title: 'Pay Off Credit Card',
        description: 'Eliminate high-interest debt',
        category: 'debt_payoff',
        targetAmount: 5000,
        currentAmount: 2000,
        targetDate: new Date('2024-06-01'),
        status: 'active',
        priority: 'high'
      }
    ];
    
    const savedGoals = await Goal.insertMany(goals);
    console.log(`✅ Created ${savedGoals.length} test goals`);
  }

  async testDatabaseService() {
    console.log('\n📊 Testing DatabaseService functionality...');
    
    try {
      // Test getUserFinancialData
      console.log('Testing getUserFinancialData...');
      const financialData = await DatabaseService.getUserFinancialData(this.testUserId);
      
      this.assert(financialData !== null, 'Financial data should not be null');
      this.assert(financialData.userProfile !== undefined, 'User profile should exist');
      this.assert(Array.isArray(financialData.recentTransactions), 'Recent transactions should be an array');
      this.assert(Array.isArray(financialData.currentGoals), 'Current goals should be an array');
      this.assert(financialData.summary !== undefined, 'Financial summary should exist');
      
      console.log(`✅ Found ${financialData.recentTransactions.length} transactions, ${financialData.currentGoals.length} goals`);
      console.log(`✅ Financial summary calculated: Net worth $${financialData.summary.netWorth}`);
      
      // Test getSpendingByCategory
      console.log('Testing getSpendingByCategory...');
      const spendingData = await DatabaseService.getSpendingByCategory(this.testUserId, new Date('2024-01-01'));
      
      this.assert(Array.isArray(spendingData), 'Spending data should be an array');
      this.assert(spendingData.length > 0, 'Should have spending categories');
      
      console.log(`✅ Found spending in ${spendingData.length} categories`);
      spendingData.forEach(category => {
        console.log(`   - ${category.label}: $${category.value.toFixed(2)}`);
      });
      
      // Test getChartData
      console.log('Testing getChartData...');
      const chartData = await DatabaseService.getChartData(this.testUserId, 'spending_by_category', 6);
      
      this.assert(Array.isArray(chartData), 'Chart data should be an array');
      console.log(`✅ Chart data generated with ${chartData.length} data points`);
      
      this.recordPass('DatabaseService functionality');
      
    } catch (error) {
      console.error('❌ DatabaseService test failed:', error.message);
      this.recordError(error);
    }
  }

  async testAIAdvisorIntegration() {
    console.log('\n🤖 Testing AI Advisor integration with real data...');
    
    try {
      // Get user profile for AI
      const user = await User.findById(this.testUserId);
      const userProfile = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        financialProfile: user.financialProfile,
        onboarding: user.onboarding
      };
      
      // Test AI advisor with real query
      console.log('Testing AI advisor with spending analysis query...');
      const query1 = "Analyze my spending patterns and suggest ways to save money";
      
      const response1 = await aiAdvisor.generateFinancialAdvice(
        userProfile,
        {}, // Let it fetch data internally
        query1
      );
      
      this.assert(response1 !== null, 'AI response should not be null');
      this.assert(typeof response1.response === 'string', 'Response should have text');
      this.assert(Array.isArray(response1.insights), 'Should have insights array');
      this.assert(Array.isArray(response1.suggestions), 'Should have suggestions array');
      
      console.log('✅ AI Response received:');
      console.log(`   Response: ${response1.response.substring(0, 100)}...`);
      console.log(`   Insights: ${response1.insights.length} items`);
      console.log(`   Suggestions: ${response1.suggestions.length} items`);
      console.log(`   Visualization: ${response1.visualization ? 'Generated' : 'None'}`);
      console.log(`   Data source: ${response1.visualization?.dataSource || 'N/A'}`);
      
      // Test with visualization-specific query
      console.log('Testing AI advisor with visualization request...');
      const query2 = "Show me a chart of where my money is going each month";
      
      const response2 = await aiAdvisor.generateFinancialAdvice(
        userProfile,
        {},
        query2
      );
      
      this.assert(response2.visualization !== undefined, 'Should generate visualization');
      if (response2.visualization && response2.visualization.data) {
        this.assert(response2.visualization.data.labels.length > 0, 'Visualization should have labels');
        this.assert(response2.visualization.data.datasets.length > 0, 'Visualization should have datasets');
        console.log(`✅ Visualization generated with ${response2.visualization.data.labels.length} categories`);
        console.log(`   Chart type: ${response2.visualization.type}`);
        console.log(`   Title: ${response2.visualization.title}`);
      }
      
      this.recordPass('AI Advisor integration');
      
    } catch (error) {
      console.error('❌ AI Advisor integration test failed:', error.message);
      this.recordError(error);
    }
  }

  async testChartDataFormatting() {
    console.log('\n📈 Testing chart data formatting...');
    
    try {
      // Get real transactions
      const transactions = await Transaction.find({ userId: this.testUserId }).lean();
      
      // Test formatRealTransactionData
      console.log('Testing formatRealTransactionData...');
      const formattedData = await aiAdvisor.formatRealTransactionData(transactions);
      
      this.assert(Array.isArray(formattedData), 'Formatted data should be an array');
      this.assert(formattedData.length > 0, 'Should have formatted data points');
      
      console.log(`✅ Formatted ${formattedData.length} data points from ${transactions.length} transactions`);
      
      formattedData.forEach(dataPoint => {
        this.assert(typeof dataPoint.label === 'string', 'Data point should have label');
        this.assert(typeof dataPoint.value === 'number', 'Data point should have numeric value');
        console.log(`   ${dataPoint.label}: $${dataPoint.value.toFixed(2)} (${dataPoint.percentage?.toFixed(1)}%)`);
      });
      
      // Test that data is properly sorted
      if (formattedData.length > 1) {
        this.assert(formattedData[0].value >= formattedData[1].value, 'Data should be sorted by value descending');
        console.log('✅ Data is properly sorted by spending amount');
      }
      
      this.recordPass('Chart data formatting');
      
    } catch (error) {
      console.error('❌ Chart data formatting test failed:', error.message);
      this.recordError(error);
    }
  }

  async testVisualizationSaving() {
    console.log('\n💾 Testing visualization saving...');
    
    try {
      const testVisualizationData = {
        title: 'Test Spending Chart',
        description: 'AI-generated spending breakdown',
        type: 'pie',
        data: {
          labels: ['Housing', 'Food', 'Transportation', 'Entertainment'],
          datasets: [{
            label: 'Amount ($)',
            data: [1800, 450, 300, 200],
            backgroundColor: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B']
          }]
        },
        prompt: 'Show me my spending breakdown',
        insights: ['Housing is your largest expense', 'Consider reducing entertainment spending']
      };
      
      const savedVisualization = await DatabaseService.saveVisualization(this.testUserId, testVisualizationData);
      
      this.assert(savedVisualization !== null, 'Visualization should be saved');
      this.assert(savedVisualization._id !== undefined, 'Saved visualization should have ID');
      this.assert(savedVisualization.userId.equals(this.testUserId), 'Visualization should belong to test user');
      this.assert(savedVisualization.title === testVisualizationData.title, 'Title should match');
      
      console.log(`✅ Visualization saved with ID: ${savedVisualization._id}`);
      console.log(`   Title: ${savedVisualization.title}`);
      console.log(`   Chart type: ${savedVisualization.chartType}`);
      console.log(`   Data points: ${savedVisualization.chartData.labels.length}`);
      
      this.recordPass('Visualization saving');
      
    } catch (error) {
      console.error('❌ Visualization saving test failed:', error.message);
      this.recordError(error);
    }
  }

  async testEndToEndFlow() {
    console.log('\n🔄 Testing complete end-to-end flow...');
    
    try {
      console.log('1. Fetching user data via DatabaseService...');
      const financialData = await DatabaseService.getUserFinancialData(this.testUserId);
      
      console.log('2. Processing data through AI advisor...');
      const userProfile = financialData.userProfile;
      const aiResponse = await aiAdvisor.generateFinancialAdvice(
        userProfile,
        financialData,
        "Create a comprehensive financial analysis with visualizations"
      );
      
      console.log('3. Validating complete response...');
      this.assert(aiResponse !== null, 'AI response should not be null');
      this.assert(typeof aiResponse.response === 'string', 'Should have text response');
      this.assert(Array.isArray(aiResponse.insights), 'Should have insights');
      this.assert(Array.isArray(aiResponse.suggestions), 'Should have suggestions');
      
      if (aiResponse.visualization) {
        console.log('4. Validating visualization data...');
        this.assert(aiResponse.visualization.type !== undefined, 'Visualization should have type');
        this.assert(aiResponse.visualization.title !== undefined, 'Visualization should have title');
        this.assert(aiResponse.visualization.data !== undefined, 'Visualization should have data');
        
        console.log(`✅ Complete flow successful with ${aiResponse.visualization.dataSource} data`);
      }
      
      this.recordPass('End-to-end flow');
      
    } catch (error) {
      console.error('❌ End-to-end flow test failed:', error.message);
      this.recordError(error);
    }
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up test data...');
    
    try {
      if (this.testUserId) {
        await Transaction.deleteMany({ userId: this.testUserId });
        await Goal.deleteMany({ userId: this.testUserId });
        await User.findByIdAndDelete(this.testUserId);
        console.log('✅ Test data cleaned up');
      }
    } catch (error) {
      console.warn('⚠️ Cleanup warning:', error.message);
    }
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  recordPass(testName) {
    this.testResults.passed++;
    console.log(`✅ PASS: ${testName}`);
  }

  recordError(error) {
    this.testResults.failed++;
    this.testResults.errors.push(error.message);
    console.error(`❌ FAIL: ${error.message}`);
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 AI ADVISOR INTEGRATION TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`📊 Total: ${this.testResults.passed + this.testResults.failed}`);
    
    if (this.testResults.failed > 0) {
      console.log('\nErrors:');
      this.testResults.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    const successRate = ((this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100).toFixed(1);
    console.log(`\n🎯 Success Rate: ${successRate}%`);
    
    if (this.testResults.failed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! AI Advisor MongoDB integration is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the errors above.');
    }
    
    console.log('='.repeat(60));
  }
}

// Helper function to run quick integration test
async function quickIntegrationTest() {
  console.log('🚀 Running quick integration test...');
  
  try {
    // Connect to database
    if (mongoose.connection.readyState === 0) {
      const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/intrst';
      await mongoose.connect(mongoURI);
    }
    
    // Find any existing user for testing
    const existingUser = await User.findOne({}).limit(1);
    
    if (!existingUser) {
      console.log('❌ No users found in database for quick test');
      return;
    }
    
    console.log(`📊 Testing with user: ${existingUser.firstName} ${existingUser.lastName}`);
    
    // Test DatabaseService
    const financialData = await DatabaseService.getUserFinancialData(existingUser._id);
    console.log(`✅ DatabaseService: ${financialData.recentTransactions?.length || 0} transactions, ${financialData.currentGoals?.length || 0} goals`);
    
    // Test AI Advisor (if API key available)
    if (process.env.GOOGLE_API_KEY) {
      const userProfile = {
        id: existingUser._id,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        email: existingUser.email,
        financialProfile: existingUser.financialProfile
      };
      
      const aiResponse = await aiAdvisor.generateFinancialAdvice(
        userProfile,
        {},
        "Give me a quick financial overview"
      );
      
      console.log(`✅ AI Advisor: Generated response with ${aiResponse.insights?.length || 0} insights`);
      console.log(`✅ Visualization: ${aiResponse.visualization ? 'Generated' : 'None'}`);
    } else {
      console.log('⚠️  Skipping AI test - no GOOGLE_API_KEY found');
    }
    
    console.log('🎉 Quick integration test completed successfully!');
    
  } catch (error) {
    console.error('❌ Quick integration test failed:', error.message);
  }
}

// Export for use in other files
module.exports = {
  AIAdvisorIntegrationTest,
  quickIntegrationTest
};

// Run tests if called directly
if (require.main === module) {
  const testSuite = new AIAdvisorIntegrationTest();
  
  // Check command line arguments
  const args = process.argv.slice(2);
  
  if (args.includes('--quick')) {
    quickIntegrationTest().then(() => process.exit(0));
  } else {
    testSuite.runAllTests().then(() => process.exit(0));
  }
}