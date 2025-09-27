const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

// Helper function to parse currency strings to numbers
const parseCurrency = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  
  // Remove currency symbols, commas, and whitespace
  const cleaned = value.replace(/[$,\s]/g, '');
  // Handle negative values in parentheses
  const isNegative = cleaned.includes('(') && cleaned.includes(')');
  const numberStr = cleaned.replace(/[()]/g, '');
  const number = parseFloat(numberStr) || 0;
  
  return isNegative ? -number : number;
};

// Helper function to parse percentage strings to numbers
const parsePercentage = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  
  const cleaned = value.replace('%', '');
  return parseFloat(cleaned) || 0;
};

// Helper function to parse dates
const parseDate = (value) => {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
};

// Parser for retirement account data (Fidelity format)
const parseRetirementData = async (filePath) => {
  const results = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          const parsed = {
            accountType: row['Account Type'] || row['accountType'] || '',
            accountNumber: row['Account Number'] || row['accountNumber'] || '',
            balance: parseCurrency(row['Balance'] || row['balance'] || 0),
            ytdContributions: parseCurrency(row['YTD Contributions'] || row['ytdContributions'] || 0),
            employerMatch: parseCurrency(row['Employer Match'] || row['employerMatch'] || 0),
            assetAllocation: row['Asset Allocation'] || row['assetAllocation'] || '',
            raw: row
          };
          results.push(parsed);
        } catch (error) {
          console.error('Error parsing retirement row:', error, row);
        }
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};

// Parser for investment data (Vanguard format)
const parseInvestmentData = async (filePath) => {
  const results = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          const parsed = {
            fundName: row['Fund Name'] || row['fundName'] || '',
            symbol: row['Symbol'] || row['symbol'] || '',
            shares: parseFloat(row['Shares'] || row['shares'] || 0),
            price: parseCurrency(row['Price'] || row['price'] || 0),
            marketValue: parseCurrency(row['Market Value'] || row['marketValue'] || 0),
            gainLoss: parseCurrency(row['Gain/Loss'] || row['gainLoss'] || 0),
            gainLossPercent: parsePercentage(row['Gain/Loss %'] || row['gainLossPercent'] || 0),
            assetClass: row['Asset Class'] || row['assetClass'] || '',
            raw: row
          };
          results.push(parsed);
        } catch (error) {
          console.error('Error parsing investment row:', error, row);
        }
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};

// Parser for brokerage data (Schwab format)
const parseBrokerageData = async (filePath) => {
  const results = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          const parsed = {
            date: parseDate(row['Date'] || row['date']),
            action: row['Action'] || row['action'] || '',
            symbol: row['Symbol'] || row['symbol'] || '',
            description: row['Description'] || row['description'] || '',
            quantity: parseFloat(row['Quantity'] || row['quantity'] || 0),
            price: parseCurrency(row['Price'] || row['price'] || 0),
            amount: parseCurrency(row['Amount'] || row['amount'] || 0),
            account: row['Account'] || row['account'] || '',
            raw: row
          };
          results.push(parsed);
        } catch (error) {
          console.error('Error parsing brokerage row:', error, row);
        }
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};

// Parser for spending data (PayPal/Venmo format)
const parseSpendingData = async (filePath) => {
  const results = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          const parsed = {
            date: parseDate(row['Date'] || row['date']),
            description: row['Description'] || row['description'] || '',
            category: row['Category'] || row['category'] || 'Other',
            amount: parseCurrency(row['Amount'] || row['amount'] || 0),
            type: row['Type'] || row['type'] || '',
            status: row['Status'] || row['status'] || '',
            merchant: row['Merchant'] || row['merchant'] || '',
            raw: row
          };
          results.push(parsed);
        } catch (error) {
          console.error('Error parsing spending row:', error, row);
        }
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};

// Parser for budget data (Mint format)
const parseBudgetData = async (filePath) => {
  const results = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          const parsed = {
            category: row['Category'] || row['category'] || '',
            budgetedAmount: parseCurrency(row['Budgeted Amount'] || row['budgetedAmount'] || 0),
            spentAmount: parseCurrency(row['Spent Amount'] || row['spentAmount'] || 0),
            remaining: parseCurrency(row['Remaining'] || row['remaining'] || 0),
            percentageUsed: parsePercentage(row['Percentage Used'] || row['percentageUsed'] || 0),
            goal: row['Goal'] || row['goal'] || '',
            status: row['Status'] || row['status'] || '',
            raw: row
          };
          results.push(parsed);
        } catch (error) {
          console.error('Error parsing budget row:', error, row);
        }
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};

// Parser for wealth data (Personal Capital format)
const parseWealthData = async (filePath) => {
  const results = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          const parsed = {
            accountType: row['Account Type'] || row['accountType'] || '',
            institution: row['Institution'] || row['institution'] || '',
            accountName: row['Account Name'] || row['accountName'] || '',
            balance: parseCurrency(row['Balance'] || row['balance'] || 0),
            change1Month: parseCurrency(row['Change (1M)'] || row['change1Month'] || 0),
            change3Month: parseCurrency(row['Change (3M)'] || row['change3Month'] || 0),
            assetClass: row['Asset Class'] || row['assetClass'] || '',
            allocationPercent: parsePercentage(row['Allocation %'] || row['allocationPercent'] || 0),
            raw: row
          };
          results.push(parsed);
        } catch (error) {
          console.error('Error parsing wealth row:', error, row);
        }
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};

// Parser for trading data (Robinhood format)
const parseTradingData = async (filePath) => {
  const results = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          const parsed = {
            date: parseDate(row['Date'] || row['date']),
            instrument: row['Instrument'] || row['instrument'] || '',
            side: row['Side'] || row['side'] || '',
            quantity: parseFloat(row['Quantity'] || row['quantity'] || 0),
            price: parseCurrency(row['Price'] || row['price'] || 0),
            totalAmount: parseCurrency(row['Total Amount'] || row['totalAmount'] || 0),
            fees: parseCurrency(row['Fees'] || row['fees'] || 0),
            state: row['State'] || row['state'] || '',
            settlementDate: parseDate(row['Settlement Date'] || row['settlementDate']),
            raw: row
          };
          results.push(parsed);
        } catch (error) {
          console.error('Error parsing trading row:', error, row);
        }
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};

// Main parser function
const parseCSVByType = async (filePath, type) => {
  try {
    switch (type) {
      case 'retirement':
        return await parseRetirementData(filePath);
      case 'investment':
        return await parseInvestmentData(filePath);
      case 'brokerage':
        return await parseBrokerageData(filePath);
      case 'spending':
        return await parseSpendingData(filePath);
      case 'budget':
        return await parseBudgetData(filePath);
      case 'wealth':
        return await parseWealthData(filePath);
      case 'trading':
        return await parseTradingData(filePath);
      default:
        throw new Error(`Unsupported CSV type: ${type}`);
    }
  } catch (error) {
    console.error(`Error parsing CSV of type ${type}:`, error);
    throw error;
  }
};

// Validate CSV data structure
const validateCSVData = (data, type) => {
  if (!Array.isArray(data) || data.length === 0) {
    return { valid: false, error: 'No data found in CSV' };
  }
  
  const requiredFields = {
    retirement: ['accountType', 'balance'],
    investment: ['symbol', 'marketValue'],
    brokerage: ['date', 'action', 'symbol'],
    spending: ['date', 'description', 'amount'],
    budget: ['category', 'budgetedAmount'],
    wealth: ['accountType', 'balance'],
    trading: ['date', 'instrument', 'side', 'quantity']
  };
  
  const required = requiredFields[type] || [];
  const sampleRow = data[0];
  
  for (const field of required) {
    if (!(field in sampleRow)) {
      return { 
        valid: false, 
        error: `Missing required field: ${field}` 
      };
    }
  }
  
  return { valid: true };
};

module.exports = {
  parseCSVByType,
  validateCSVData,
  parseCurrency,
  parsePercentage,
  parseDate
};
