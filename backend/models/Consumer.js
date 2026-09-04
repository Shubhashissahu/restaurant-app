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
    required: [true, 'Email is required'],
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    match: [/^[0-9]{10}$/, 'Phone must be 10 digits']
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