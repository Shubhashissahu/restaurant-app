const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');

// POST /api/menu — Add a new menu item
router.post('/', async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    if (!name || !description || price === undefined) {
      return res.status(400).json({ message: 'Name, description, and price are required' });
    }

    const item = new MenuItem({ name, description, price, category });
    await item.save();
    res.status(201).json({ message: 'Menu item added', item });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/menu — Fetch menu items with optional price filter
// Query params: ?maxPrice=100 or ?minPrice=100&maxPrice=500
router.get('/', async (req, res) => {
  try {
    const { minPrice, maxPrice } = req.query;

    let filter = {};

    if (minPrice !== undefined) {
      filter.price = { ...filter.price, $gte: Number(minPrice) };
    }
    if (maxPrice !== undefined) {
      filter.price = { ...filter.price, $lte: Number(maxPrice) };
    }

    const items = await MenuItem.find(filter).sort({ price: 1 });
    res.json(items);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;