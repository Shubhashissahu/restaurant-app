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
// PUT /api/menu/:id — Update menu item

router.put('/:id', async (req, res) => {
  try {

    const { id } = req.params;

    const updatedItem = await MenuItem.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedItem) {
      return res.status(404).json({
        message: 'Menu item not found',
      });
    }

    res.json({
      message: 'Menu item updated successfully',
      item: updatedItem,
    });

  } catch (err) {

    res.status(500).json({
      message: 'Server error',
      error: err.message,
    });

  }
});
// DELETE /api/menu/:id — Delete menu item

router.delete('/:id', async (req, res) => {
  try {

    const { id } = req.params;

    const deletedItem = await MenuItem.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({
        message: 'Menu item not found',
      });
    }

    res.json({
      message: 'Menu item deleted successfully',
    });

  } catch (err) {

    res.status(500).json({
      message: 'Server error',
      error: err.message,
    });

  }
});

module.exports = router;