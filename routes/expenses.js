const express = require('express');
const router = express.Router();
// Normalize CJS/ESM import: require returns { default: Model } for some builds
const ExpenseImport = require('../models/Expense');
const Expense = ExpenseImport && ExpenseImport.default ? ExpenseImport.default : ExpenseImport;
console.log('Expense import type:', typeof Expense, 'ExpenseImport keys:', Object.keys(ExpenseImport || {}));

// GET all expenses
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new expense
router.post('/', async (req, res) => {
  if (!Expense || typeof Expense.create !== 'function') {
    console.error('Expense model is not a model/constructor. Import value:', Expense);
    return res.status(500).json({ message: 'Server misconfiguration: Expense model not available' });
  }

  try {
    const newExpense = await Expense.create({
      amount: req.body.amount,
      category: req.body.category,
      description: req.body.description,
      date: req.body.date
    });
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE expense
router.delete('/:id', async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;