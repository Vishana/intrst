const express = require('express');
const Transaction = require('../models/Transaction');
const { auth, requireOnboarding } = require('../middleware/auth');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

const router = express.Router();

// Configure multer for CSV uploads
const upload = multer({ dest: 'uploads/' });

// @route   GET /api/transactions
// @desc    Get user's transactions
// @access  Private
router.get('/', auth, requireOnboarding, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      type, 
      startDate, 
      endDate 
    } = req.query;
    
    const query = { userId: req.user._id };
    
    if (category) query['category.primary'] = category;
    if (type) query.type = type;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Transaction.countDocuments(query);
    
    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
    
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/transactions
// @desc    Create a new transaction
// @access  Private
router.post('/', auth, requireOnboarding, async (req, res) => {
  try {
    const transactionData = { ...req.body, userId: req.user._id };
    const transaction = new Transaction(transactionData);
    await transaction.save();
    
    res.status(201).json({
      message: 'Transaction created successfully',
      transaction
    });
    
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/transactions/upload-csv
// @desc    Upload transactions via CSV
// @access  Private
router.post('/upload-csv', auth, requireOnboarding, upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No CSV file provided' });
    }
    
    const transactions = [];
    const errors = [];
    
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (row) => {
        try {
          // Parse CSV row into transaction format
          const transaction = {
            userId: req.user._id,
            date: new Date(row.date),
            amount: parseFloat(row.amount),
            description: row.description || '',
            category: {
              primary: row.category || 'other'
            },
            type: row.type || (parseFloat(row.amount) > 0 ? 'income' : 'expense'),
            source: 'csv_upload',
            importMeta: {
              originalId: row.id || '',
              importBatch: req.file.filename
            }
          };
          
          transactions.push(transaction);
        } catch (error) {
          errors.push({ row, error: error.message });
        }
      })
      .on('end', async () => {
        try {
          // Insert valid transactions
          if (transactions.length > 0) {
            await Transaction.insertMany(transactions);
          }
          
          // Clean up uploaded file
          fs.unlinkSync(req.file.path);
          
          res.json({
            message: 'CSV processed successfully',
            imported: transactions.length,
            errors: errors.length,
            errorDetails: errors
          });
          
        } catch (dbError) {
          console.error('Database insertion error:', dbError);
          res.status(500).json({ message: 'Error saving transactions to database' });
        }
      });
      
  } catch (error) {
    console.error('CSV upload error:', error);
    res.status(500).json({ message: 'Server error processing CSV' });
  }
});

// @route   GET /api/transactions/generate-sample-csv
// @desc    Generate sample CSV data for testing
// @access  Private
router.get('/generate-sample-csv', auth, (req, res) => {
  try {
    const categories = ['food', 'transportation', 'entertainment', 'shopping', 'utilities', 'income'];
    const merchants = ['Amazon', 'Starbucks', 'Uber', 'Target', 'Electric Company', 'Employer'];
    
    let csvContent = 'date,amount,description,category,type\n';
    
    // Generate 50 sample transactions
    for (let i = 0; i < 50; i++) {
      const date = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
      const isIncome = Math.random() < 0.2; // 20% chance of income
      const amount = isIncome 
        ? (2000 + Math.random() * 3000) // Income: $2000-$5000
        : -(10 + Math.random() * 200); // Expense: $10-$210
      const category = categories[Math.floor(Math.random() * categories.length)];
      const merchant = merchants[Math.floor(Math.random() * merchants.length)];
      const type = isIncome ? 'income' : 'expense';
      
      csvContent += `${date.toISOString().split('T')[0]},${amount},"${merchant}",${category},${type}\n`;
    }
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="sample-transactions.csv"');
    res.send(csvContent);
    
  } catch (error) {
    console.error('Generate CSV error:', error);
    res.status(500).json({ message: 'Server error generating CSV' });
  }
});

module.exports = router;
