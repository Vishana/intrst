#!/usr/bin/env node

/**
 * Simple test runner script for AI Advisor MongoDB integration
 * Usage: node run_integration_test.js [--quick]
 */

const { AIAdvisorIntegrationTest, quickIntegrationTest } = require('./test_ai_mongodb_integration');

async function main() {
  const args = process.argv.slice(2);
  
  console.log('🚀 AI Advisor MongoDB Integration Test Runner');
  console.log('=' .repeat(50));
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage:
  node run_integration_test.js           # Run full test suite
  node run_integration_test.js --quick   # Run quick integration test
  node run_integration_test.js --help    # Show this help

The full test suite will:
1. Create a test user with sample financial data
2. Test DatabaseService functionality 
3. Test AI Advisor integration with real data
4. Test chart data formatting
5. Test visualization saving
6. Clean up test data

The quick test uses existing user data to verify integration.
`);
    return;
  }
  
  if (args.includes('--quick') || args.includes('-q')) {
    console.log('⚡ Running quick integration test with existing data...\n');
    await quickIntegrationTest();
  } else {
    console.log('🧪 Running comprehensive test suite...\n');
    const testSuite = new AIAdvisorIntegrationTest();
    await testSuite.runAllTests();
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test runner failed:', error.message);
    process.exit(1);
  });
}