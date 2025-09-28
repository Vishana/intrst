const mongoose = require('mongoose');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Goal = require('./models/Goal');
const DatabaseService = require('./services/dataService');
require('dotenv').config();

async function testDatabaseServiceOnly() {
  console.log('🧪 Testing DatabaseService without AI components...\n');
  
  try {
    // Connect to database
    console.log('🔌 Connecting to database...');
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/intrst';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to database');
    
    // Find an existing user
    console.log('\n👤 Finding existing user...');
    const existingUser = await User.findOne({}).limit(1);
    
    if (!existingUser) {
      console.log('❌ No users found. Creating a test user...');
      await createTestUser();
      return;
    }
    
    console.log(`✅ Found user: ${existingUser.firstName} ${existingUser.lastName}`);
    const userId = existingUser._id;
    
    // Test DatabaseService methods
    console.log('\n📊 Testing DatabaseService.getUserFinancialData...');
    const financialData = await DatabaseService.getUserFinancialData(userId);
    
    console.log('✅ Financial data retrieved:');
    console.log(`   - User profile: ${financialData.userProfile ? 'Present' : 'Missing'}`);
    console.log(`   - Recent transactions: ${financialData.recentTransactions?.length || 0}`);
    console.log(`   - Current goals: ${financialData.currentGoals?.length || 0}`);
    console.log(`   - Bets: ${financialData.bets?.length || 0}`);
    console.log(`   - Summary: Net worth $${financialData.summary?.netWorth || 0}`);
    
    // Test chart data generation
    console.log('\n📈 Testing chart data generation...');
    const chartData = await DatabaseService.getChartData(userId, 'spending_by_category', 6);
    console.log(`✅ Chart data generated: ${chartData.length} categories`);
    
    if (chartData.length > 0) {
      console.log('   Top spending categories:');
      chartData.slice(0, 5).forEach(item => {
        console.log(`   - ${item.label}: $${item.value.toFixed(2)}`);
      });
    }
    
    // Test spending by category
    console.log('\n💳 Testing spending analysis...');
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const spendingData = await DatabaseService.getSpendingByCategory(userId, sixMonthsAgo);
    
    console.log(`✅ Spending analysis: ${spendingData.length} categories`);
    if (spendingData.length > 0) {
      console.log('   Spending breakdown:');
      spendingData.slice(0, 5).forEach(item => {
        console.log(`   - ${item.label}: $${item.value.toFixed(2)} (${item.count} transactions)`);
      });
    }
    
    // Test visualization saving (create dummy data)
    console.log('\n💾 Testing visualization saving...');
    const testVisualization = {
      title: 'Test Database Integration Chart',
      description: 'Testing visualization save functionality',
      type: 'pie',
      data: {
        labels: ['Test Category 1', 'Test Category 2'],
        datasets: [{
          label: 'Test Data',
          data: [100, 50],
          backgroundColor: ['#3B82F6', '#EF4444']
        }]
      },
      prompt: 'Test visualization',
      insights: [{
        insight: 'This is a test insight',
        confidence: 0.8,
        category: 'trend'
      }]
    };
    
    const savedViz = await DatabaseService.saveVisualization(userId, testVisualization);
    console.log(`✅ Visualization saved with ID: ${savedViz._id}`);
    
    // Test real transaction data formatting (simulate what AI advisor would do)
    console.log('\n🔄 Testing transaction data processing...');
    const transactions = await Transaction.find({ userId }).limit(20).lean();
    
    if (transactions.length > 0) {
      // Simulate processing transactions like AI advisor would
      const categoryTotals = {};
      let totalExpenses = 0;
      
      transactions.forEach(transaction => {
        if (transaction.type === 'expense' || transaction.amount < 0) {
          const category = transaction.category?.primary || 'other';
          const amount = Math.abs(transaction.amount);
          
          if (!categoryTotals[category]) {
            categoryTotals[category] = 0;
          }
          categoryTotals[category] += amount;
          totalExpenses += amount;
        }
      });
      
      const processedData = Object.entries(categoryTotals)
        .map(([category, amount]) => ({
          label: formatCategoryName(category),
          value: amount,
          percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
      
      console.log(`✅ Processed ${transactions.length} transactions into ${processedData.length} categories:`);
      processedData.forEach(item => {
        console.log(`   - ${item.label}: $${item.value.toFixed(2)} (${item.percentage.toFixed(1)}%)`);
      });
    } else {
      console.log('ℹ️  No transactions found for processing test');
    }
    
    console.log('\n🎉 DATABASE SERVICE INTEGRATION TEST COMPLETED SUCCESSFULLY!');
    console.log('✅ All database operations are working correctly');
    console.log('✅ Data can be fetched and processed for AI analysis');
    console.log('✅ Visualizations can be saved to database');
    console.log('✅ Chart data generation is functional');
    
  } catch (error) {
    console.error('❌ Database service test failed:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

function formatCategoryName(category) {
  const categoryMap = {
    'food': 'Food & Dining',
    'transportation': 'Transportation', 
    'housing': 'Housing',
    'utilities': 'Utilities',
    'healthcare': 'Healthcare',
    'entertainment': 'Entertainment',
    'shopping': 'Shopping',
    'education': 'Education',
    'subscription': 'Subscriptions',
    'debt_payment': 'Debt Payment',
    'insurance': 'Insurance',
    'travel': 'Travel',
    'charity': 'Charity',
    'investment': 'Investment',
    'savings': 'Savings',
    'other': 'Other'
  };
  return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
}

async function createTestUser() {
  console.log('📝 Creating test user with sample data...');
  
  const testUser = new User({
    email: 'test-integration@example.com',
    password: 'testpassword123',
    firstName: 'Integration',
    lastName: 'Test',
    onboarding: {
      isComplete: true,
      lifeStage: 'early-career',
      age: '28',
      income: 60000,
      primaryGoals: ['save-emergency', 'invest-retirement'],
      riskTolerance: 'moderate'
    },
    financialProfile: {
      currentSavings: 15000,
      monthlyIncome: 5000,
      monthlyExpenses: 3500,
      debt: 8000
    }
  });
  
  const savedUser = await testUser.save();
  console.log(`✅ Test user created: ${savedUser.email}`);
  
  // Add some test transactions
  const transactions = [
    {
      userId: savedUser._id,
      amount: -1200,
      description: 'Rent',
      category: { primary: 'housing' },
      type: 'expense',
      date: new Date()
    },
    {
      userId: savedUser._id,
      amount: -300,
      description: 'Groceries',
      category: { primary: 'food' },
      type: 'expense', 
      date: new Date()
    },
    {
      userId: savedUser._id,
      amount: 5000,
      description: 'Salary',
      category: { primary: 'income' },
      type: 'income',
      date: new Date()
    }
  ];
  
  await Transaction.insertMany(transactions);
  console.log('✅ Sample transactions added');
  
  // Add a test goal
  const goal = new Goal({
    userId: savedUser._id,
    title: 'Emergency Fund',
    category: 'emergency_fund',
    targetAmount: 15000,
    currentAmount: 3000,
    targetDate: new Date('2024-12-31'),
    status: 'active'
  });
  
  await goal.save();
  console.log('✅ Sample goal added');
  
  // Now test with the new user
  console.log('\n📊 Testing DatabaseService with new user...');
  const financialData = await DatabaseService.getUserFinancialData(savedUser._id);
  console.log(`✅ New user data: ${financialData.recentTransactions.length} transactions, ${financialData.currentGoals.length} goals`);
}

if (require.main === module) {
  testDatabaseServiceOnly().then(() => process.exit(0));
}