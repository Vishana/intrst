const express = require('express');
const Goal = require('../models/Goal');
const { auth, requireOnboarding, checkResourceOwnership } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/goals
// @desc    Get user's goals
// @access  Private
router.get('/', auth, requireOnboarding, async (req, res) => {
  try {
    const { status = 'active', sort = '-createdAt' } = req.query;
    
    const query = { userId: req.user._id };
    if (status !== 'all') query.status = status;
    
    const goals = await Goal.find(query).sort(sort);
    
    res.json({
      goals: goals.map(goal => ({
        id: goal._id,
        title: goal.title,
        description: goal.description,
        category: goal.category,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        targetDate: goal.targetDate,
        progress: goal.progress,
        status: goal.status,
        daysRemaining: goal.getDaysRemaining(),
        isOnTrack: goal.isOnTrack(),
        requiredDailySavings: goal.getRequiredDailySavings(),
        createdAt: goal.createdAt
      }))
    });
    
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/goals
// @desc    Create a new goal
// @access  Private
router.post('/', auth, requireOnboarding, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      targetAmount,
      targetDate,
      priority = 'medium'
    } = req.body;
    
    const goal = new Goal({
      userId: req.user._id,
      title,
      description,
      category,
      targetAmount,
      targetDate,
      priority
    });
    
    await goal.save();
    
    res.status(201).json({
      message: 'Goal created successfully',
      goal: {
        id: goal._id,
        title: goal.title,
        targetAmount: goal.targetAmount,
        targetDate: goal.targetDate,
        progress: goal.progress
      }
    });
    
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/goals/:id
// @desc    Update a goal
// @access  Private
router.put('/:id', auth, checkResourceOwnership(Goal), async (req, res) => {
  try {
    const updates = req.body;
    const goal = req.resource;
    
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        goal[key] = updates[key];
      }
    });
    
    await goal.save();
    
    res.json({
      message: 'Goal updated successfully',
      goal
    });
    
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/goals/:id/contribute
// @desc    Add contribution to goal
// @access  Private
router.post('/:id/contribute', auth, checkResourceOwnership(Goal), async (req, res) => {
  try {
    const { amount, description = '', source = 'manual' } = req.body;
    const goal = req.resource;
    
    goal.addContribution(amount, source, description);
    await goal.save();
    
    res.json({
      message: 'Contribution added successfully',
      goal: {
        id: goal._id,
        currentAmount: goal.currentAmount,
        progress: goal.progress,
        status: goal.status
      }
    });
    
  } catch (error) {
    console.error('Add contribution error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/goals/:id
// @desc    Delete a goal
// @access  Private
router.delete('/:id', auth, checkResourceOwnership(Goal), async (req, res) => {
  try {
    await Goal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
