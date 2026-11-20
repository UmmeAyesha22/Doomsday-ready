const express = require('express');
const cors = require('cors');
const db = require('./db');
const movieRoutes = require('./routes/movieRoutes');
const cinemaRoutes = require('./routes/cinemaRoutes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');



const app = express();

app.use(cors());
app.use(express.json());

// Health check: is the server alive?
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Health check: can the server reach the database?
app.get('/api/health/db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({ status: 'ok', time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.use('/api/movies', movieRoutes);
app.use('/api/cinemas', cinemaRoutes);

// These two must stay last
app.use(notFound);
app.use(errorHandler);

module.exports = app;