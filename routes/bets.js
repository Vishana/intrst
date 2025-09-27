const express = require('express');
const Bet = require('../models/Bet');
const { auth, requireOnboarding } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/bets
// @desc    Get user's bets
// @access  Private
router.get('/', auth, requireOnboarding, async (req, res) => {
  try {
    const bets = await Bet.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ bets });
  } catch (error) {
    console.error('Get bets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/bets
// @desc    Create a new bet
// @access  Private
router.post('/', auth, requireOnboarding, async (req, res) => {
  try {
    const betData = { ...req.body, userId: req.user._id };
    const bet = new Bet(betData);
    await bet.save();
    
    res.status(201).json({
      message: 'Bet created successfully',
      bet
    });
  } catch (error) {
    console.error('Create bet error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/bets/:id/payment
// @desc    Process bet payment
// @access  Private
router.post('/:id/payment', auth, async (req, res) => {
  try {
    // This is where Stripe integration would go
    // For now, just simulate payment processing
    
    const bet = await Bet.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!bet) {
      return res.status(404).json({ message: 'Bet not found' });
    }
    
    // Simulate successful payment
    bet.status = 'active';
    bet.payment.amountPaid = bet.stakeAmount;
    bet.payment.paymentDate = new Date();
    await bet.save();
    
    res.json({
      message: 'Payment processed successfully',
      bet
    });
    
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ message: 'Payment processing failed' });
  }
});

module.exports = router;
