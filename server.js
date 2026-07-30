// server.js
// Production-ready Express server for the JEE/NEET Waitlist MVP
// Serves index.html as a static file and handles waitlist submissions in-memory.

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Middleware ----
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname))); // serves index.html + any other static assets

// ---- In-memory "database" ----
// NOTE: This resets every time the server restarts.
// Swap for a real DB (MongoDB/Postgres/MySQL) before scaling past MVP.
global.waitlistDB = [];

// ---- Validation helper ----
function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ---- Root route: serve index.html ----
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ---- POST /api/waitlist ----
app.post('/api/waitlist', (req, res) => {
  const { name, email, exam } = req.body || {};

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'Valid name is required.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: 'Valid email is required.' });
  }
  if (!exam || !['JEE', 'NEET'].includes(exam)) {
    return res.status(400).json({ success: false, message: 'Exam must be JEE or NEET.' });
  }

  const entry = {
    id: waitlistDB.length + 1,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    exam,
    timestamp: new Date().toISOString(),
  };

  waitlistDB.push(entry);

  console.log(
    `[${entry.timestamp}] ✅ New waitlist signup — ID:${entry.id} | ${entry.name} | ${entry.email} | ${entry.exam} | Total: ${waitlistDB.length}`
  );

  return res.status(201).json({
    success: true,
    message: 'Added',
    position: waitlistDB.length,
  });
});

// ---- Start server ----
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
