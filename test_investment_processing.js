const mongoose = require('mongoose');
const DatabaseService = require('./services/dataService');
const User = require('./models/User');

async function testInvestmentProcessing() {
  try {
    console.log('🧪 Testing Investment Data Processing');
    console.log('=====================================\n');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/intrst');
    console.log('✅ Connected to MongoDB\n');
    
    // Find Riva's user account
    const user = await User.findOne().lean();
    if (!user) {
      console.log('❌ No users found in database');
      return;
    }
    
    console.log('👤 Testing with user:', user.firstName, user.lastName);
    console.log('📧 Email:', user.email);
    console.log('🆔 ID:', user._id, '\n');
    
    // Test the enhanced getUserFinancialData method
    console.log('🔍 Testing Enhanced getUserFinancialData...');
    const financialData = await DatabaseService.getUserFinancialData(user._id);
    
    console.log('\n📊 RESULTS:');
    console.log('===========');
    console.log('📈 Total transactions (including processed integrations):', financialData.recentTransactions.length);
    console.log('🎯 Goals:', financialData.currentGoals.length);
    console.log('🎲 Bets:', financialData.bets.length);
    console.log('📊 Visualizations:', financialData.visualizations.length);
    
    console.log('\n💰 Financial Summary:');
    console.log('- Data source:', financialData.summary.dataSource);
    console.log('- Net worth:', financialData.summary.netWorth);
    console.log('- Monthly income:', financialData.summary.monthlyIncome);
    console.log('- Monthly expenses:', financialData.summary.monthlyExpenses);
    console.log('- Top spending categories:', financialData.summary.topSpendingCategories.length);
    
    console.log('\n🔗 Raw Integrations Data:');
    console.log('- Spending entries:', financialData.integrationsData.spending.length);
    console.log('- Investment entries:', financialData.integrationsData.investment.length);
    console.log('- Retirement entries:', financialData.integrationsData.retirement.length);
    console.log('- Connected accounts:', financialData.integrationsData.connectedAccounts.length);
    console.log('- Has insights:', Object.keys(financialData.integrationsData.insights).length > 0);
    
    // Show sample processed transactions
    if (financialData.recentTransactions.length > 0) {
      console.log('\n📋 Sample Processed Transactions:');
      financialData.recentTransactions.slice(0, 3).forEach((transaction, index) => {
        console.log(`${index + 1}. ${transaction.description || 'N/A'}`);
        console.log(`   Amount: $${Math.abs(transaction.amount)}`);
        console.log(`   Type: ${transaction.type}`);
        console.log(`   Source: ${transaction.source}`);
        console.log(`   Category: ${transaction.category?.primary || 'N/A'}`);
        console.log(`   Date: ${transaction.date}`);
        console.log('');
      });
    }
    
    // Show investment allocation if available
    if (financialData.integrationsData.insights.investmentAllocation) {
      console.log('📈 Investment Allocation:');
      financialData.integrationsData.insights.investmentAllocation.forEach(allocation => {
        console.log(`- ${allocation.assetClass}: ${allocation.percentage}% ($${allocation.value.toFixed(2)})`);
      });
    }
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
testInvestmentProcessing();