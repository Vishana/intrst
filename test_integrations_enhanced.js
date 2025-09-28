const DatabaseService = require('./services/dataService');

async function testIntegrationsProcessing() {
  try {
    const userId = '68d791bf448a94b906714085'; // Riva's user ID
    
    console.log('🧪 Testing enhanced integrations processing...');
    const financialData = await DatabaseService.getUserFinancialData(userId);
    
    console.log('\n📊 Results:');
    console.log('- Total transactions (including integrations):', financialData.recentTransactions.length);
    console.log('- Integration transactions count:', financialData.recentTransactions.filter(t => t.source === 'integration').length);
    console.log('- Manual transactions count:', financialData.recentTransactions.filter(t => t.source !== 'integration').length);
    
    console.log('\n💰 Integration transactions sample:');
    const integrationTxns = financialData.recentTransactions.filter(t => t.source === 'integration');
    integrationTxns.slice(0, 3).forEach(txn => {
      console.log(`- ${txn.description}: $${txn.amount} (${txn.type}, ${txn.category.primary})`);
    });
    
    console.log('\n📈 Financial Summary:');
    console.log('- Data source:', financialData.summary.dataSource);
    console.log('- Net worth:', `$${financialData.summary.netWorth}`);
    console.log('- Monthly income:', `$${financialData.summary.monthlyIncome}`);
    console.log('- Monthly expenses:', `$${financialData.summary.monthlyExpenses}`);
    console.log('- Top categories:', financialData.summary.topSpendingCategories.length);
    
    console.log('\n🔗 Raw integrations data:');
    console.log('- Spending entries:', financialData.integrationsData.spending.length);
    console.log('- Investment entries:', financialData.integrationsData.investment.length);
    console.log('- Retirement entries:', financialData.integrationsData.retirement.length);
    
    if (financialData.recentTransactions.length > 0) {
      console.log('\n✅ SUCCESS: Integrations data successfully processed into transactions!');
    } else {
      console.log('\n❌ ISSUE: No transactions found, integrations not processed');
    }
    
  } catch (error) {
    console.error('❌ Error testing integrations:', error.message);
  }
}

testIntegrationsProcessing();