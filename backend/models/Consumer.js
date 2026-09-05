const mongoose = require('mongoose');

const consumerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
  },
  email: {
    type: String,
    required: false,
    default: '',
    trim: true,
    lowercase: true,
    validate: {
      validator: function (v) {
        if (!v || v.trim() === '') return true; // optional
        return /^\S+@\S+\.\S+$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    trim: true,
    minlength: [3, 'Phone must be at least 3 digits'],
    maxlength: [20, 'Phone must not exceed 20 digits']
  },
  partyType: {
    type: String,
    enum: ['Family', 'Friends', 'Couple', 'Office Colleagues', 'Other'],
    default: 'Couple'
  },
  customOccasion: {
    type: String,
    default: '',
    trim: true
  },
  guests: {
    type: Number,
    default: 2,
    min: [1, 'At least 1 guest required']
  },
  reservationDate: {
    type: String,
    default: ''
  },
  reservationTime: {
    type: String,
    default: ''
  },
  seatingPreference: {
    type: String,
    default: 'Indoor Dining'
  },
  specialRequests: {
    type: String,
    default: '',
    trim: true
  },
  bookingCode: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Confirmed', 'Pending', 'Seated', 'Completed', 'Cancelled'],
    default: 'Confirmed'
  }
}, { timestamps: true });

module.exports = mongoose.model('Consumer', consumerSchema);