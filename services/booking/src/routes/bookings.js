const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// List all bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.render('index', {
      title: 'Bookings',
      bookings
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).render('index', {
      title: 'Bookings',
      bookings: [],
      error: 'Failed to load bookings'
    });
  }
});

// Show new booking form
router.get('/new', (req, res) => {
  res.render('booking', {
    title: 'New Booking',
    booking: null,
    action: 'create'
  });
});

// Create new booking
router.post('/', async (req, res) => {
  try {
    const { name, email, date, service, notes } = req.body;
    const booking = new Booking({ name, email, date, service, notes });
    await booking.save();
    res.redirect(res.locals.basePath);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).render('booking', {
      title: 'New Booking',
      booking: req.body,
      action: 'create',
      error: 'Failed to create booking'
    });
  }
});

// Show single booking
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).render('booking', {
        title: 'Booking Not Found',
        booking: null,
        error: 'Booking not found'
      });
    }
    res.render('booking', {
      title: 'Edit Booking',
      booking,
      action: 'edit'
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).redirect(res.locals.basePath);
  }
});

// Update booking
router.post('/:id', async (req, res) => {
  try {
    const { name, email, date, service, notes } = req.body;
    await Booking.findByIdAndUpdate(req.params.id, {
      name, email, date, service, notes
    });
    res.redirect(res.locals.basePath);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).redirect(res.locals.basePath);
  }
});

// Delete booking
router.post('/:id/delete', async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.redirect(res.locals.basePath);
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).redirect(res.locals.basePath);
  }
});

// API endpoints
router.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

module.exports = router;
