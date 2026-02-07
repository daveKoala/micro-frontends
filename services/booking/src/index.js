const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const bookingsRouter = require('./routes/bookings');

const app = express();
const PORT = process.env.PORT || 5001;
const BASE_PATH = process.env.BASE_PATH || '/booking';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/booking';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// Make BASE_PATH available to all templates
app.use((req, res, next) => {
  res.locals.basePath = BASE_PATH;
  next();
});

// Parse request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(`${BASE_PATH}/static`, express.static(path.join(__dirname, '../public')));

// Routes
app.use(BASE_PATH, bookingsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'booking' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Booking service running on port ${PORT}`);
  console.log(`Base path: ${BASE_PATH}`);
});
