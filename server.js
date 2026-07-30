const express = require('express');
const path = require('path');

const app = express();
const waitlistDB = [];
let currentId = 1;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Static files (HTML, CSS, JS)

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index-3.html')); // तेरी फाइल का नाम index-3.html है, ध्यान रहे!
});

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
  console.log('✅ New Signup:', newEntry); // ये Vercel Logs में दिखेगा

  res.status(201).json({
    success: true,
    message: 'Added to waitlist',
    position: waitlistDB.length
  });
});

// 🔥 YEH LINE SABSE IMPORTANT HAI — Vercel के लिए Export
module.exports = app;

// ---- Start server ----
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
