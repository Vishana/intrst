const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { parseCSVByType, validateCSVData } = require('../services/csvParser');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'csv');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${req.params.provider}-${req.params.type}-${uniqueSuffix}.csv`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

// Sample CSV data for different integration types
const sampleData = {
  retirement: {
    filename: 'fidelity_retirement_sample.csv',
    headers: ['Account Type', 'Account Number', 'Balance', 'YTD Contributions', 'Employer Match', 'Asset Allocation', 'Last Updated'],
    data: [
      ['401k', '****1234', '$45,230.50', '$8,500.00', '$4,250.00', '70% Stocks / 30% Bonds', '2025-09-27'],
      ['Roth IRA', '****5678', '$12,450.75', '$6,500.00', '$0.00', '80% Stocks / 20% Bonds', '2025-09-27'],
      ['Traditional IRA', '****9012', '$8,900.25', '$2,000.00', '$0.00', '60% Stocks / 40% Bonds', '2025-09-27']
    ]
  },
  
  investment: {
    filename: 'vanguard_investment_sample.csv',
    headers: ['Fund Name', 'Symbol', 'Shares', 'Price', 'Market Value', 'Gain/Loss', 'Gain/Loss %', 'Asset Class'],
    data: [
      ['Vanguard Total Stock Market Index', 'VTSAX', '125.45', '$112.34', '$14,092.13', '+$1,234.56', '+9.62%', 'Stock'],
      ['Vanguard Total Bond Market Index', 'VBTLX', '85.20', '$10.45', '$890.34', '-$45.23', '-4.83%', 'Bond'],
      ['Vanguard S&P 500 Index', 'VFIAX', '42.10', '$425.67', '$17,920.71', '+$2,105.34', '+13.31%', 'Stock'],
      ['Vanguard International Stock Index', 'VTIAX', '65.33', '$38.92', '$2,543.04', '+$156.78', '+6.57%', 'International Stock']
    ]
  },
  
  brokerage: {
    filename: 'schwab_brokerage_sample.csv',
    headers: ['Date', 'Action', 'Symbol', 'Description', 'Quantity', 'Price', 'Amount', 'Account'],
    data: [
      ['2025-09-25', 'Buy', 'AAPL', 'Apple Inc', '10', '$175.23', '-$1,752.30', 'Individual'],
      ['2025-09-24', 'Sell', 'TSLA', 'Tesla Inc', '5', '$245.67', '+$1,228.35', 'Individual'],
      ['2025-09-23', 'Dividend', 'MSFT', 'Microsoft Corp', '25', '$2.34', '+$58.50', 'Individual'],
      ['2025-09-22', 'Buy', 'VOO', 'Vanguard S&P 500 ETF', '15', '$456.78', '-$6,851.70', 'IRA']
    ]
  },
  
  spending: {
    filename: 'paypal_spending_sample.csv',
    headers: ['Date', 'Description', 'Category', 'Amount', 'Type', 'Status', 'Merchant'],
    data: [
      ['2025-09-27', 'Coffee Shop Purchase', 'Food & Dining', '-$5.75', 'Payment', 'Completed', 'Starbucks'],
      ['2025-09-26', 'Uber Ride', 'Transportation', '-$12.50', 'Payment', 'Completed', 'Uber Technologies'],
      ['2025-09-25', 'Amazon Purchase', 'Shopping', '-$89.99', 'Payment', 'Completed', 'Amazon.com'],
      ['2025-09-24', 'Netflix Subscription', 'Entertainment', '-$15.99', 'Recurring Payment', 'Completed', 'Netflix'],
      ['2025-09-23', 'Friend Payment', 'Personal', '+$25.00', 'Received', 'Completed', 'John Smith']
    ]
  },
  
  budget: {
    filename: 'mint_budget_sample.csv',
    headers: ['Category', 'Budgeted Amount', 'Spent Amount', 'Remaining', 'Percentage Used', 'Goal', 'Status'],
    data: [
      ['Food & Dining', '$600.00', '$487.23', '$112.77', '81.2%', 'Stay Under Budget', 'On Track'],
      ['Transportation', '$300.00', '$245.67', '$54.33', '81.9%', 'Stay Under Budget', 'On Track'],
      ['Shopping', '$400.00', '$523.45', '-$123.45', '130.9%', 'Stay Under Budget', 'Over Budget'],
      ['Entertainment', '$200.00', '$156.78', '$43.22', '78.4%', 'Stay Under Budget', 'On Track'],
      ['Utilities', '$250.00', '$234.56', '$15.44', '93.8%', 'Stay Under Budget', 'Warning']
    ]
  },
  
  wealth: {
    filename: 'personal_capital_wealth_sample.csv',
    headers: ['Account Type', 'Institution', 'Account Name', 'Balance', 'Change (1M)', 'Change (3M)', 'Asset Class', 'Allocation %'],
    data: [
      ['Investment', 'Fidelity', '401k Account', '$125,430.50', '+$5,234.67', '+$12,450.23', 'Mixed', '35.2%'],
      ['Investment', 'Vanguard', 'Roth IRA', '$45,670.25', '+$2,103.45', '+$5,678.90', 'Stocks', '12.8%'],
      ['Cash', 'Chase Bank', 'Checking Account', '$8,450.75', '+$1,234.56', '+$2,567.89', 'Cash', '2.4%'],
      ['Cash', 'Ally Bank', 'Savings Account', '$25,600.00', '+$456.78', '+$1,234.56', 'Cash', '7.2%'],
      ['Investment', 'E*TRADE', 'Brokerage Account', '$67,890.33', '+$3,456.78', '+$8,901.23', 'Mixed', '19.1%']
    ]
  },
  
  trading: {
    filename: 'robinhood_trading_sample.csv',
    headers: ['Date', 'Instrument', 'Side', 'Quantity', 'Price', 'Total Amount', 'Fees', 'State', 'Settlement Date'],
    data: [
      ['2025-09-27', 'AAPL', 'buy', '5', '$175.23', '$876.15', '$0.00', 'filled', '2025-09-29'],
      ['2025-09-26', 'TSLA', 'sell', '2', '$245.67', '$491.34', '$0.00', 'filled', '2025-09-28'],
      ['2025-09-25', 'SPY', 'buy', '10', '$456.78', '$4,567.80', '$0.00', 'filled', '2025-09-27'],
      ['2025-09-24', 'BTC', 'buy', '0.1', '$43,500.00', '$4,350.00', '$0.00', 'filled', '2025-09-24'],
      ['2025-09-23', 'NVDA', 'sell', '3', '$432.10', '$1,296.30', '$0.00', 'filled', '2025-09-25']
    ]
  }
};

// @route   GET /api/integrations/sample-csv/:type
// @desc    Download sample CSV for integration type
// @access  Public (for demo purposes)
router.get('/sample-csv/:type', (req, res) => {
  const { type } = req.params;
  
  if (!sampleData[type]) {
    return res.status(404).json({ message: 'CSV type not found' });
  }
  
  const data = sampleData[type];
  const filePath = path.join(__dirname, '..', 'public', 'sample-data', data.filename);
  
  // Check if file exists
  if (fs.existsSync(filePath)) {
    // Serve the actual file
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${data.filename}"`);
    res.sendFile(filePath);
  } else {
    // Fallback to generated CSV
    let csvContent = data.headers.join(',') + '\n';
    data.data.forEach(row => {
      csvContent += row.map(field => `"${field}"`).join(',') + '\n';
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${data.filename}"`);
    res.send(csvContent);
  }
});

// @route   GET /api/integrations/available-types
// @desc    Get list of available integration types
// @access  Public
router.get('/available-types', (req, res) => {
  const types = Object.keys(sampleData).map(type => ({
    type,
    filename: sampleData[type].filename,
    headers: sampleData[type].headers,
    sampleCount: sampleData[type].data.length
  }));
  
  res.json({ types });
});

// @route   POST /api/integrations/upload/:provider/:type
// @desc    Upload and process CSV file for integration
// @access  Private
router.post('/upload/:provider/:type', auth, upload.single('csvFile'), async (req, res) => {
  try {
    const { provider, type } = req.params;
    const userId = req.user._id; // The auth middleware puts the full user object in req.user

    if (!req.file) {
      return res.status(400).json({ message: 'No CSV file uploaded' });
    }

    console.log(`Processing CSV upload for user ${userId}, provider: ${provider}, type: ${type}`);

    // Parse the CSV file
    const parsedData = await parseCSVByType(req.file.path, type);
    
    // Validate the parsed data
    const validation = validateCSVData(parsedData, type);
    if (!validation.valid) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        message: 'Invalid CSV format', 
        error: validation.error 
      });
    }

    console.log(`Parsed ${parsedData.length} records from CSV`);

    // Find and update user
    const user = await User.findById(userId);
    if (!user) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'User not found' });
    }

    // Add integration data to user profile
    user.addIntegrationData(provider, type, parsedData);
    await user.save();

    console.log(`Successfully saved integration data for user ${userId}`);

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      message: 'CSV uploaded and processed successfully',
      provider,
      type,
      recordsProcessed: parsedData.length,
      lastSync: new Date().toISOString(),
      insights: user.integrations.insights
    });

  } catch (error) {
    console.error('CSV upload error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      message: 'Failed to process CSV file', 
      error: error.message 
    });
  }
});

// @route   GET /api/integrations/user-data
// @desc    Get user's integration data and insights
// @access  Private
router.get('/user-data', auth, async (req, res) => {
  try {
    // Add debugging
    console.log('Auth middleware provided user:', req.user ? 'User object exists' : 'No user object');
    console.log('User ID from req.user._id:', req.user?._id);
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const summary = user.getFinancialSummary();
    
    res.json({
      connected: user.integrations.connected || [],
      insights: user.integrations.insights || {},
      summary,
      data: {
        // Only return aggregated data, not raw records for performance
        retirement: user.integrations.data.retirement?.length || 0,
        investment: user.integrations.data.investment?.length || 0,
        brokerage: user.integrations.data.brokerage?.length || 0,
        spending: user.integrations.data.spending?.length || 0,
        budget: user.integrations.data.budget?.length || 0,
        wealth: user.integrations.data.wealth?.length || 0,
        trading: user.integrations.data.trading?.length || 0
      }
    });
  } catch (error) {
    console.error('Get user data error:', error);
    res.status(500).json({ message: 'Failed to fetch user data' });
  }
});

// @route   DELETE /api/integrations/disconnect/:provider/:type
// @desc    Disconnect an integration and remove its data
// @access  Private
router.delete('/disconnect/:provider/:type', auth, async (req, res) => {
  try {
    const { provider, type } = req.params;
    const user = await User.findById(req.user._id); // Use _id instead of userId
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove from connected integrations
    user.integrations.connected = user.integrations.connected.filter(
      conn => !(conn.provider === provider && conn.type === type)
    );

    // Remove data for this provider/type
    if (user.integrations.data[type]) {
      user.integrations.data[type] = user.integrations.data[type].filter(
        item => item.provider !== provider
      );
    }

    // Recalculate insights
    user.calculateIntegrationsInsights();
    await user.save();

    res.json({ 
      message: 'Integration disconnected successfully',
      provider,
      type 
    });
  } catch (error) {
    console.error('Disconnect error:', error);
    res.status(500).json({ message: 'Failed to disconnect integration' });
  }
});

// @route   POST /api/integrations/upload-csv/:type
// @desc    Process uploaded CSV file (placeholder for real integration)
// @access  Private (would require auth in real implementation)
router.post('/upload-csv/:type', (req, res) => {
  const { type } = req.params;
  
  if (!sampleData[type]) {
    return res.status(404).json({ message: 'Integration type not found' });
  }
  
  // In a real implementation, this would:
  // 1. Parse the CSV file
  // 2. Validate the data format
  // 3. Store the data in the database
  // 4. Update user's connected integrations
  
  // For now, just simulate success
  res.json({
    message: 'CSV uploaded and processed successfully',
    type,
    status: 'connected',
    recordsProcessed: Math.floor(Math.random() * 100) + 10,
    lastSync: new Date().toISOString()
  });
});

module.exports = router;
