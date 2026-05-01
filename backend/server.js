const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const connectDB      = require('./config/db');
const app = express();
connectDB();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());                          // JSON body parsing
app.use(express.urlencoded({ extended: true }));  // Form data parsing
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/consumers', require('./routes/consumers'));
app.use('/api/menu', require('./routes/menu'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
