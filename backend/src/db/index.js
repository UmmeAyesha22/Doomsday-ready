const { Pool } = require('pg');
const config = require('../config');

// A pool keeps a few connections open and reuses them
const pool = new Pool({ connectionString: config.databaseUrl });

// Run several queries as one unit: all succeed, or all are rolled back
async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  withTransaction,
  pool,
};
