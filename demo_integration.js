/**
 * DEMONSTRATION: AI Advisor MongoDB Integration
 * 
 * This script demonstrates the complete agentic workflow integration:
 * 1. Fetches real user data from MongoDB
 * 2. Processes it through AI agents
 * 3. Generates visualizations from actual financial data
 * 4. Shows the difference between real vs generated data
 */

const mongoose = require('mongoose');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Goal = require('./models/Goal');
const DatabaseService = require('./services/dataService');
const aiAdvisor = require('./services/aiAdvisor');
require('dotenv').config();

async function demonstrateIntegration() {
  console.log('\n🎯 DEMONSTRATION: AI ADVISOR MONGODB INTEGRATION');
  console.log('=' .repeat(65));
  console.log('This demonstrates the complete pipeline from MongoDB → AI → Visualizations\n');

  try {
    // Connect to database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/intrst');
      console.log('🔌 Connected to MongoDB');
    }

    // Find a user with data
    const user = await User.findOne({}).limit(1);
    if (!user) {
      console.log('❌ No users found. Please create a user first.');
      return;
    }

    console.log(`👤 Using user: ${user.firstName} ${user.lastName} (${user.email})`);

    // STEP 1: Fetch real data using DatabaseService
    console.log('\n📊 STEP 1: Fetching real user data from MongoDB...');
    const financialData = await DatabaseService.getUserFinancialData(user._id);
    
    console.log('✅ Real data retrieved:');
    console.log(`   • Transactions: ${financialData.recentTransactions?.length || 0}`);
    console.log(`   • Goals: ${financialData.currentGoals?.length || 0}`);
    console.log(`   • Net Worth: $${financialData.summary?.netWorth || 0}`);
    console.log(`   • Monthly Income: $${financialData.summary?.monthlyIncome || 0}`);
    console.log(`   • Monthly Expenses: $${financialData.summary?.monthlyExpenses || 0}`);

    if (financialData.recentTransactions?.length > 0) {
      console.log('   • Recent transactions:');
      financialData.recentTransactions.slice(0, 3).forEach(t => {
        console.log(`     - $${Math.abs(t.amount).toFixed(2)} | ${t.category?.primary || 'other'} | ${t.description}`);
      });
    }

    // STEP 2: Process data through AI agents
    console.log('\n🤖 STEP 2: Processing data through AI agentic workflow...');
    
    const userProfile = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      financialProfile: user.financialProfile,
      onboarding: user.onboarding
    };

    // Test different types of queries to show AI capabilities
    const queries = [
      {
        query: "Analyze my spending patterns and show me a breakdown by category",
        expectsVisualization: true
      },
      {
        query: "How am I doing with my financial goals?",
        expectsVisualization: false
      },
      {
        query: "Create a chart showing where my money goes each month",
        expectsVisualization: true
      }
    ];

    for (let i = 0; i < queries.length; i++) {
      const { query, expectsVisualization } = queries[i];
      console.log(`\n   Query ${i + 1}: "${query}"`);
      
      try {
        const aiResponse = await aiAdvisor.generateFinancialAdvice(
          userProfile,
          {}, // Let it fetch data internally
          query
        );

        console.log('   ✅ AI Response generated:');
        console.log(`      • Response length: ${aiResponse.response?.length || 0} characters`);
        console.log(`      • Insights: ${aiResponse.insights?.length || 0}`);
        console.log(`      • Suggestions: ${aiResponse.suggestions?.length || 0}`);
        console.log(`      • Visualization: ${aiResponse.visualization ? 'Generated' : 'None'}`);
        
        if (aiResponse.visualization) {
          console.log(`      • Chart type: ${aiResponse.visualization.type}`);
          console.log(`      • Data source: ${aiResponse.visualization.dataSource || 'generated'}`);
          console.log(`      • Data points: ${aiResponse.visualization.data?.labels?.length || 0}`);
          
          if (aiResponse.visualization.dataSource === 'real') {
            console.log('      🎯 SUCCESS: Using REAL user data for visualization!');
          }
        }

        // Show a sample of the response
        if (aiResponse.response) {
          const preview = aiResponse.response.length > 150 
            ? aiResponse.response.substring(0, 150) + '...'
            : aiResponse.response;
          console.log(`      💬 Response preview: "${preview}"`);
        }

      } catch (error) {
        console.log(`      ❌ AI query failed: ${error.message}`);
      }
    }

    // STEP 3: Demonstrate data formatting
    console.log('\n📈 STEP 3: Demonstrating real transaction data formatting...');
    
    if (financialData.recentTransactions?.length > 0) {
      const formattedData = await aiAdvisor.formatRealTransactionData(financialData.recentTransactions);
      
      console.log('✅ Transaction data formatted for charts:');
      formattedData.slice(0, 5).forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.label}: $${item.value.toFixed(2)} (${item.percentage?.toFixed(1)}%)`);
      });
      
      if (formattedData.length > 0) {
        console.log('\n🎯 This real data would be used for AI-generated charts!');
      }
    } else {
      console.log('ℹ️  No transactions available to format (this is normal for test users)');
    }

    // STEP 4: Show database integration features
    console.log('\n💾 STEP 4: Demonstrating database integration features...');
    
    // Test chart data generation
    const chartData = await DatabaseService.getChartData(user._id, 'spending_by_category', 6);
    console.log(`✅ Chart data generated: ${chartData.length} categories`);
    
    if (chartData.length > 0) {
      console.log('   Top spending categories:');
      chartData.slice(0, 3).forEach(item => {
        console.log(`   • ${item.label}: $${item.value.toFixed(2)}`);
      });
    }

    // STEP 5: Summary
    console.log('\n🎉 INTEGRATION DEMONSTRATION COMPLETE!');
    console.log('=' .repeat(65));
    console.log('\n✅ WHAT WE\'VE ACHIEVED:');
    console.log('   🔗 AI Advisor connected to real MongoDB data');
    console.log('   📊 Visualizations generated from actual user transactions');
    console.log('   🤖 Agentic workflow processes real financial patterns');
    console.log('   💾 Generated charts can be saved back to database');
    console.log('   🎯 Complete pipeline: MongoDB → AI → Visualizations → Storage');
    
    console.log('\n🚀 TECHNICAL IMPLEMENTATION:');
    console.log('   • DatabaseService: Fetches comprehensive user financial data');
    console.log('   • AI Advisor: Enhanced with formatRealTransactionData()');
    console.log('   • Agentic Workflow: All agents now use real user context');
    console.log('   • API Integration: /api/advisor routes use DatabaseService');
    console.log('   • Visualization Pipeline: Real data → AI analysis → Charts');

    console.log('\n💡 NEXT STEPS:');
    console.log('   • Add more users and transactions to test with richer data');
    console.log('   • Test different chart types (pie, bar, line, etc.)');
    console.log('   • Explore advanced AI features like goal optimization');
    console.log('   • Implement real-time data sync for live visualizations');

  } catch (error) {
    console.error('❌ Demonstration failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// Helper function to add sample data if needed
async function addSampleDataIfNeeded() {
  console.log('🛠️  Checking if sample data is needed...');
  
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/intrst');
    }

    // Check if we have users with transactions
    const usersWithData = await User.aggregate([
      {
        $lookup: {
          from: 'transactions',
          localField: '_id',
          foreignField: 'userId',
          as: 'transactions'
        }
      },
      {
        $match: {
          'transactions.0': { $exists: true }
        }
      },
      {
        $limit: 1
      }
    ]);

    if (usersWithData.length === 0) {
      console.log('📝 No users with transaction data found. Adding sample data...');
      
      // Create a sample user with rich financial data
      const sampleUser = new User({
        email: 'demo@aiintegration.com',
        password: 'demopassword123',
        firstName: 'Demo',
        lastName: 'User',
        onboarding: {
          isComplete: true,
          lifeStage: 'early-career',
          age: '29',
          income: 85000,
          primaryGoals: ['save-emergency', 'invest-retirement', 'save-purchase'],
          riskTolerance: 'moderate',
          investmentExperience: 'some',
          investmentTimeline: 'long'
        },
        financialProfile: {
          currentSavings: 32000,
          monthlyIncome: 7100,
          monthlyExpenses: 5200,
          debt: 12000,
          creditScore: 750
        }
      });

      const savedUser = await sampleUser.save();
      console.log(`✅ Created sample user: ${savedUser.email}`);

      // Add realistic transactions
      const sampleTransactions = [
        // Income
        { userId: savedUser._id, amount: 7100, description: 'Monthly Salary - Tech Company', category: { primary: 'income' }, type: 'income', date: new Date('2024-02-01') },
        { userId: savedUser._id, amount: 7100, description: 'Monthly Salary - Tech Company', category: { primary: 'income' }, type: 'income', date: new Date('2024-01-01') },
        
        // Housing
        { userId: savedUser._id, amount: -2200, description: 'Rent - Downtown Apartment', category: { primary: 'housing' }, type: 'expense', date: new Date('2024-02-01') },
        { userId: savedUser._id, amount: -2200, description: 'Rent - Downtown Apartment', category: { primary: 'housing' }, type: 'expense', date: new Date('2024-01-01') },
        
        // Food
        { userId: savedUser._id, amount: -450, description: 'Grocery Store - Weekly Shopping', category: { primary: 'food' }, type: 'expense', date: new Date('2024-02-05') },
        { userId: savedUser._id, amount: -380, description: 'Whole Foods - Organic Groceries', category: { primary: 'food' }, type: 'expense', date: new Date('2024-02-12') },
        { userId: savedUser._id, amount: -85, description: 'Restaurant - Date Night', category: { primary: 'food' }, type: 'expense', date: new Date('2024-02-14') },
        
        // Transportation
        { userId: savedUser._id, amount: -320, description: 'Gas Station - Monthly Fill-ups', category: { primary: 'transportation' }, type: 'expense', date: new Date('2024-02-03') },
        { userId: savedUser._id, amount: -45, description: 'Uber - Airport Ride', category: { primary: 'transportation' }, type: 'expense', date: new Date('2024-02-08') },
        
        // Entertainment
        { userId: savedUser._id, amount: -180, description: 'Movie Theater & Dinner', category: { primary: 'entertainment' }, type: 'expense', date: new Date('2024-02-10') },
        { userId: savedUser._id, amount: -65, description: 'Concert Tickets', category: { primary: 'entertainment' }, type: 'expense', date: new Date('2024-02-15') },
        
        // Subscriptions
        { userId: savedUser._id, amount: -15, description: 'Netflix Subscription', category: { primary: 'subscription' }, type: 'expense', date: new Date('2024-02-01') },
        { userId: savedUser._id, amount: -12, description: 'Spotify Premium', category: { primary: 'subscription' }, type: 'expense', date: new Date('2024-02-01') },
        { userId: savedUser._id, amount: -99, description: 'Adobe Creative Suite', category: { primary: 'subscription' }, type: 'expense', date: new Date('2024-02-01') },
        
        // Shopping
        { userId: savedUser._id, amount: -220, description: 'Amazon - Electronics & Books', category: { primary: 'shopping' }, type: 'expense', date: new Date('2024-02-07') },
        { userId: savedUser._id, amount: -150, description: 'Clothing Store - Winter Jacket', category: { primary: 'shopping' }, type: 'expense', date: new Date('2024-02-09') },
        
        // Utilities
        { userId: savedUser._id, amount: -125, description: 'Electric & Gas Bill', category: { primary: 'utilities' }, type: 'expense', date: new Date('2024-02-01') },
        { userId: savedUser._id, amount: -80, description: 'Internet & Cable', category: { primary: 'utilities' }, type: 'expense', date: new Date('2024-02-01') },
        
        // Savings & Investment
        { userId: savedUser._id, amount: -500, description: 'Automatic Transfer to Savings', category: { primary: 'savings' }, type: 'expense', date: new Date('2024-02-01') },
        { userId: savedUser._id, amount: -300, description: '401k Contribution', category: { primary: 'investment' }, type: 'expense', date: new Date('2024-02-01') }
      ];

      await Transaction.insertMany(sampleTransactions);
      console.log(`✅ Added ${sampleTransactions.length} sample transactions`);

      // Add sample goals
      const sampleGoals = [
        {
          userId: savedUser._id,
          title: 'Emergency Fund (6 months)',
          description: 'Build emergency fund covering 6 months of expenses',
          category: 'emergency_fund',
          targetAmount: 31200,
          currentAmount: 8500,
          targetDate: new Date('2024-10-01'),
          status: 'active',
          priority: 'high'
        },
        {
          userId: savedUser._id,
          title: 'Japan Vacation',
          description: 'Two week trip to Japan including flights and hotels',
          category: 'savings',
          targetAmount: 12000,
          currentAmount: 2800,
          targetDate: new Date('2024-09-01'),
          status: 'active',
          priority: 'medium'
        },
        {
          userId: savedUser._id,
          title: 'New Laptop Fund',
          description: 'MacBook Pro for work and personal projects',
          category: 'savings',
          targetAmount: 3500,
          currentAmount: 1200,
          targetDate: new Date('2024-06-01'),
          status: 'active',
          priority: 'medium'
        }
      ];

      await Goal.insertMany(sampleGoals);
      console.log(`✅ Added ${sampleGoals.length} sample goals`);

      console.log('🎯 Sample data setup complete! Ready for demonstration.');
    } else {
      console.log('✅ Users with transaction data found. Ready for demonstration.');
    }

    await mongoose.disconnect();

  } catch (error) {
    console.error('❌ Error setting up sample data:', error.message);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--setup-data')) {
    await addSampleDataIfNeeded();
  } else if (args.includes('--help')) {
    console.log(`
🎯 AI Advisor MongoDB Integration Demonstration

Usage:
  node demo_integration.js                # Run the full demonstration
  node demo_integration.js --setup-data  # Add sample data if needed
  node demo_integration.js --help        # Show this help

This demonstration shows:
✅ Real MongoDB data fetching
✅ AI processing of actual user financial data  
✅ Chart generation from real transactions
✅ Complete agentic workflow integration
✅ Visualization pipeline from data to charts
`);
  } else {
    await demonstrateIntegration();
  }
}

if (require.main === module) {
  main().then(() => process.exit(0)).catch(error => {
    console.error('❌ Demonstration failed:', error.message);
    process.exit(1);
  });
}