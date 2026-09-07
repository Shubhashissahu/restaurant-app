//routes/menu
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const MenuItem = require('../models/MenuItem');
const verifyToken = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// Configure multer storage for food photos
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'dish-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif|svg\+xml|svg/;
  const isMimeValid = allowed.test(file.mimetype);
  const isExtValid = allowed.test(path.extname(file.originalname).toLowerCase().replace('.', ''));
  if (isMimeValid || isExtValid) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, JPG, PNG, WEBP, GIF, SVG) are allowed'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter
});

// POST /api/menu/upload — Upload dish photo
router.post('/upload', verifyToken, (req, res) => {
  upload.single('photo')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size exceeds 5MB limit' });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please select an image file to upload' });
    }

    const relativeUrl = `/uploads/${req.file.filename}`;
    res.json({
      message: 'Photo uploaded successfully',
      imageUrl: relativeUrl,
      filename: req.file.filename
    });
  });
});

// POST /api/menu — Add a new menu item
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, description, price, category, image, imageUrl } = req.body;

    if (!name || !description || price === undefined) {
      return res.status(400).json({ message: 'Name, description, and price are required' });
    }

    const resolvedImage = (image || imageUrl || '').trim();

    const item = new MenuItem({
      name,
      description,
      price,
      category: category || 'Main Course',
      image: resolvedImage,
      imageUrl: resolvedImage
    });
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
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.json(items);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// PUT /api/menu/:id — Update menu item

router.put('/:id', verifyToken, async (req, res) => {
  try {

    const { id } = req.params;
    const updateData = { ...req.body };

    // Prevent immutable field errors
    delete updateData._id;
    delete updateData.id;

    if (updateData.image !== undefined || updateData.imageUrl !== undefined) {
      const resolved = (updateData.image || updateData.imageUrl || '').trim();
      updateData.image = resolved;
      updateData.imageUrl = resolved;
    }

    if (updateData.isAvailable !== undefined && updateData.status === undefined) {
      updateData.status = updateData.isAvailable ? 'Available' : 'Unavailable';
    } else if (updateData.status !== undefined) {
      const isUnavailable = updateData.status === 'Unavailable' || updateData.status === 'Sold Out';
      updateData.status = isUnavailable ? 'Unavailable' : 'Available';
      if (updateData.isAvailable === undefined) {
        updateData.isAvailable = !isUnavailable;
      }
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(
      id,
      updateData,
      {
        returnDocument: 'after',
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

// PATCH /api/menu/:id/availability — Toggle or update dish availability
router.patch('/:id/availability', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const item = await MenuItem.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    let isAvailable;
    if (typeof req.body.isAvailable === 'boolean') {
      isAvailable = req.body.isAvailable;
    } else if (req.body.status) {
      isAvailable = req.body.status !== 'Unavailable' && req.body.status !== 'Sold Out';
    } else {
      isAvailable = !(item.isAvailable !== false && item.status !== 'Unavailable' && item.status !== 'Sold Out');
    }

    item.isAvailable = isAvailable;
    item.status = isAvailable ? 'Available' : 'Unavailable';
    await item.save();

    res.json({
      message: `Dish "${item.name}" is now marked as ${item.status}`,
      item,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
// DELETE /api/menu/:id — Delete menu item

router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
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