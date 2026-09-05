//routes/consumer
const express = require('express');
const router = express.Router();
const Consumer = require('../models/Consumer');
const verifyToken = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const isManager = require('../middleware/isManager');

// POST /api/consumers — Register a new consumer / reserve a table
router.post('/', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      partyType = 'Couple',
      customOccasion = '',
      guests = 2,
      reservationDate = '',
      reservationTime = '',
      seatingPreference = 'Indoor Dining',
      specialRequests = '',
      status = 'Confirmed'
    } = req.body;

    // Manual validation layer
    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone are required' });
    }

    const bookingCode = `TH-${Math.floor(100000 + Math.random() * 900000)}`;

    // If consumer email provided and exists, update their latest table reservation
    let existing = null;
    if (email && email.trim() !== '') {
      existing = await Consumer.findOne({ email: email.trim().toLowerCase() });
    }
    if (existing) {
      existing.name = name;
      existing.phone = phone;
      existing.partyType = partyType || existing.partyType;
      existing.customOccasion = customOccasion !== undefined ? customOccasion : existing.customOccasion;
      existing.guests = Number(guests) || existing.guests || 2;
      existing.reservationDate = reservationDate || existing.reservationDate;
      existing.reservationTime = reservationTime || existing.reservationTime;
      existing.seatingPreference = seatingPreference || existing.seatingPreference;
      existing.specialRequests = specialRequests !== undefined ? specialRequests : existing.specialRequests;
      existing.bookingCode = bookingCode;
      existing.status = status || existing.status || 'Confirmed';

      await existing.save();
      return res.status(200).json({
        message: 'Table reserved successfully! Your reservation is confirmed.',
        consumer: existing,
        bookingCode
      });
    }

    const consumer = new Consumer({
      name,
      email,
      phone,
      partyType,
      customOccasion,
      guests: Number(guests) || 2,
      reservationDate,
      reservationTime,
      seatingPreference,
      specialRequests,
      bookingCode,
      status: status || 'Confirmed'
    });
    await consumer.save();

    res.status(201).json({
      message: 'Table reserved successfully! Your reservation is confirmed.',
      consumer,
      bookingCode
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/consumers — Fetch all consumers
router.get('/', verifyToken, async (req, res) => {
  try {
    const consumers = await Consumer.find().sort({ createdAt: -1 });
    res.json(consumers);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/consumers/:id — Update consumer
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      partyType,
      customOccasion,
      guests,
      reservationDate,
      reservationTime,
      seatingPreference,
      specialRequests,
      status
    } = req.body;

    // Validation
    if (!name || !phone) {
      return res.status(400).json({
        message: 'Name and phone are required',
      });
    }

    const updateFields = {
      name,
      phone,
    };
    if (email !== undefined) updateFields.email = email ? email.trim().toLowerCase() : '';
    if (partyType !== undefined) updateFields.partyType = partyType;
    if (customOccasion !== undefined) updateFields.customOccasion = customOccasion;
    if (guests !== undefined) updateFields.guests = Number(guests);
    if (reservationDate !== undefined) updateFields.reservationDate = reservationDate;
    if (reservationTime !== undefined) updateFields.reservationTime = reservationTime;
    if (seatingPreference !== undefined) updateFields.seatingPreference = seatingPreference;
    if (specialRequests !== undefined) updateFields.specialRequests = specialRequests;
    if (status !== undefined) updateFields.status = status;

    const updatedConsumer = await Consumer.findByIdAndUpdate(
      id,
      updateFields,
      {
        new: true,
        runValidators: false,
      }
    );

    if (!updatedConsumer) {
      return res.status(404).json({
        message: 'Consumer not found',
      });
    }

    res.json({
      message: 'Reservation details updated successfully',
      consumer: updatedConsumer,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: 'Email already exists',
      });
    }
    res.status(500).json({
      message: 'Server error',
      error: err.message,
    });
  }
});
// DELETE /api/consumers/:id — Delete consumer
router.delete('/:id', verifyToken, isManager, async (req, res) => {
  try {

    const { id } = req.params;

    const deletedConsumer =
      await Consumer.findByIdAndDelete(id);

    if (!deletedConsumer) {
      return res.status(404).json({
        message: 'Consumer not found',
      });
    }

    res.json({
      message: 'Consumer deleted successfully',
    });

  } catch (err) {

    res.status(500).json({
      message: 'Server error',
      error: err.message,
    });

  }
});

module.exports = router;