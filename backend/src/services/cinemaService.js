const db = require('../db');
const { findMinBundles } = require('../algorithms/bookingQuote');
const AppError = require('../errors/AppError');

// One query that returns a cinema together with its bundle sizes
const SELECT_CINEMAS = `
  SELECT c.id, c.name,
         ARRAY(
           SELECT b.size
           FROM cinema_bundles b
           WHERE b.cinema_id = c.id
           ORDER BY b.size
         ) AS bundle_sizes
  FROM cinemas c
`;

function toCinema(row) {
  return { id: row.id, name: row.name, bundleSizes: row.bundle_sizes };
}

// `queryable` is either `db` or a transaction client, both have .query()
async function getCinemaById(queryable, id) {
  const { rows } = await queryable.query(`${SELECT_CINEMAS} WHERE c.id = $1`, [id]);
  if (rows.length === 0) {
    throw new AppError(404, 'CINEMA_NOT_FOUND', `Cinema ${id} not found`);
  }
  return toCinema(rows[0]);
}

async function getCinema(id) {
  return getCinemaById(db, id);
}

async function listCinemas() {
  const { rows } = await db.query(`${SELECT_CINEMAS} ORDER BY c.id`);
  return rows.map(toCinema);
}

async function createCinema(data) {
  try {
    return await db.withTransaction(async (client) => {
      const { rows } = await client.query(
        'INSERT INTO cinemas (name) VALUES ($1) RETURNING id',
        [data.name]
      );
      const id = rows[0].id;

      await client.query(
        'INSERT INTO cinema_bundles (cinema_id, size) SELECT $1, unnest($2::int[])',
        [id, data.bundleSizes]
      );
      return getCinemaById(client, id);
    });
  } catch (err) {
    // 23505 is PostgreSQL's "unique violation" code (duplicate name)
    if (err.code === '23505') {
      throw new AppError(409, 'DUPLICATE_NAME', 'A cinema with this name already exists');
    }
    throw err;
  }
}

async function getBookingQuote(id, groupSize) {
  const cinema = await getCinema(id);
  const result = findMinBundles(cinema.bundleSizes, groupSize);

  const quote = {
    cinema: { id: cinema.id, name: cinema.name },
    groupSize,
  };

  if (result === null) {
    return {
      ...quote,
      possible: false,
      totalBundles: null,
      bundles: [],
      message: `Not possible: no combination of bundle sizes adds up to exactly ${groupSize} seats`,
    };
  }

  return { ...quote, possible: true, totalBundles: result.totalBundles, bundles: result.bundles };
}

module.exports = { listCinemas, createCinema, getCinema, getBookingQuote };