const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Health check: a quick way to see the server is alive
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
