const express = require('express');
const path = require('path');

const app = express();
const waitlistDB = [];
let currentId = 1;

// ✅ Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ✅ Root Route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index-3.html'));
});

// ✅ Waitlist API
app.post('/api/waitlist', (req, res) => {
  const { name, email, exam } = req.body;
  if (!name || !email || !exam) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  const newEntry = {
    id: currentId++,
    name,
    email,
    exam,
    timestamp: new Date().toISOString()
  };
  waitlistDB.push(newEntry);
  console.log('✅ New Signup:', JSON.stringify(newEntry));

  res.status(201).json({
    success: true,
    message: 'Added to waitlist',
    position: waitlistDB.length
  });
});

// 🔥 VERCEL EXPORT (सिर्फ यही काफी है—app.listen() हटा दो)
module.exports = app;
