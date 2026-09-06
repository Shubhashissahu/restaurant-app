const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    default: 'Main Course'
  },
  image: {
    type: String,
    default: '',
    trim: true
  },
  imageUrl: {
    type: String,
    default: '',
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);