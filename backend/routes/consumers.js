const express = require('express');
const router = express.Router();
const Consumer = require('../models/Consumer');

// POST /api/consumers — Register a new consumer
router.post('/', async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    // Manual validation layer (belt-and-suspenders alongside Mongoose)
    if (!name || !email || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await Consumer.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const consumer = new Consumer({ name, email, phone });
    await consumer.save();

    res.status(201).json({ message: 'Consumer registered successfully', consumer });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/consumers — Fetch all consumers
router.get('/', async (req, res) => {
  try {
    const consumers = await Consumer.find().sort({ createdAt: -1 });
    res.json(consumers);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;