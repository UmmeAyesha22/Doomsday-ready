const { Pool } = require('pg');
const config = require('../config');

// A pool keeps a few connections open and reuses them
const pool = new Pool({ connectionString: config.databaseUrl });

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
