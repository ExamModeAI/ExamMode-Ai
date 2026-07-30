// server.js
// Production server for ExamMode AI Waitlist — Vercel + MongoDB Atlas

const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// ---- MongoDB connection (cached across serverless invocations) ----
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set.');
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();

  const db = client.db('exammodeai'); // change db name here if you prefer a different one

  cachedClient = client;
  cachedDb = db;

  console.log('✅ Connected to MongoDB Atlas');
  return db;
}

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ---- Root route ----
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ---- POST /api/waitlist ----
app.post('/api/waitlist', async (req, res) => {
  try {
    const { name, email, exam } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Valid name required.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Valid email required.' });
    }
    if (!exam || !['JEE', 'NEET'].includes(exam)) {
      return res.status(400).json({ success: false, message: 'Exam must be JEE or NEET.' });
    }

    const db = await connectToDatabase();
    const collection = db.collection('waitlists');

    const newEntry = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      exam,
      timestamp: new Date().toISOString(),
    };

    await collection.insertOne(newEntry);

    const totalCount = await collection.countDocuments();

    console.log(`[${newEntry.timestamp}] ✅ New signup — ${newEntry.name} (${newEntry.email}) — ${newEntry.exam} — position ${totalCount}`);

    return res.status(201).json({
      success: true,
      message: 'Added',
      position: totalCount,
    });
  } catch (err) {
    console.error('❌ Error saving to MongoDB:', err.message);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ---- Local dev only: Vercel handles listening via the exported app ----
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;
