const db = require('../db');
const AppError = require('../errors/AppError');

// One query that returns a movie together with its prerequisite ids
const SELECT_MOVIES = `
  SELECT m.id, m.title, m.release_year, m.runtime_minutes, m.watched,
         ARRAY(
           SELECT p.prerequisite_id
           FROM movie_prerequisites p
           WHERE p.movie_id = m.id
           ORDER BY p.prerequisite_id
         ) AS prerequisites
  FROM movies m
`;

function toMovie(row) {
  return {
    id: row.id,
    title: row.title,
    releaseYear: row.release_year,
    runtimeMinutes: row.runtime_minutes,
    watched: row.watched,
    prerequisites: row.prerequisites,
  };
}

async function getMovieById(client, id) {
  const { rows } = await client.query(`${SELECT_MOVIES} WHERE m.id = $1`, [id]);
  if (rows.length === 0) {
    throw new AppError(404, 'MOVIE_NOT_FOUND', `Movie ${id} not found`);
  }
  return toMovie(rows[0]);
}

async function assertPrerequisitesExist(client, ids) {
  if (ids.length === 0) return;
  const { rows } = await client.query('SELECT id FROM movies WHERE id = ANY($1::int[])', [ids]);
  const found = new Set(rows.map((row) => row.id));
  const missing = ids.filter((id) => !found.has(id));
  if (missing.length > 0) {
    throw new AppError(
      400,
      'INVALID_PREREQUISITES',
      `Prerequisite movie(s) not found: ${missing.join(', ')}`
    );
  }
}

async function replacePrerequisites(client, movieId, ids) {
  await client.query('DELETE FROM movie_prerequisites WHERE movie_id = $1', [movieId]);
  if (ids.length === 0) return;
  await client.query(
    'INSERT INTO movie_prerequisites (movie_id, prerequisite_id) SELECT $1, unnest($2::int[])',
    [movieId, ids]
  );
}

// 23505 is PostgreSQL's "unique violation" code (duplicate title)
function translateDbError(err) {
  if (err.code === '23505') {
    return new AppError(409, 'DUPLICATE_TITLE', 'A movie with this title already exists');
  }
  return err;
}

async function listMovies() {
  const { rows } = await db.query(`${SELECT_MOVIES} ORDER BY m.id`);
  return rows.map(toMovie);
}

async function createMovie(data) {
  try {
    return await db.withTransaction(async (client) => {
      await assertPrerequisitesExist(client, data.prerequisites);

      const { rows } = await client.query(
        `INSERT INTO movies (title, release_year, runtime_minutes, watched)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [data.title, data.releaseYear, data.runtimeMinutes, data.watched]
      );
      const id = rows[0].id;

      await replacePrerequisites(client, id, data.prerequisites);
      return getMovieById(client, id);
    });
  } catch (err) {
    throw translateDbError(err);
  }
}

// Maps API field names to database column names (fixed list, so it is safe)
const UPDATABLE_COLUMNS = {
  title: 'title',
  releaseYear: 'release_year',
  runtimeMinutes: 'runtime_minutes',
  watched: 'watched',
};

async function updateMovie(id, data) {
  try {
    return await db.withTransaction(async (client) => {
      const existing = await client.query('SELECT id FROM movies WHERE id = $1 FOR UPDATE', [id]);
      if (existing.rows.length === 0) {
        throw new AppError(404, 'MOVIE_NOT_FOUND', `Movie ${id} not found`);
      }

      if (data.prerequisites !== undefined) {
        if (data.prerequisites.includes(id)) {
          throw new AppError(409, 'CIRCULAR_DEPENDENCY', 'A movie cannot be its own prerequisite');
        }
        await assertPrerequisitesExist(client, data.prerequisites);

        // STEP 4: the full cycle check (A -> B -> C -> A) will go here

        await replacePrerequisites(client, id, data.prerequisites);
      }

      const sets = [];
      const values = [];
      for (const [key, column] of Object.entries(UPDATABLE_COLUMNS)) {
        if (data[key] !== undefined) {
          values.push(data[key]);
          sets.push(`${column} = $${values.length}`);
        }
      }
      if (sets.length > 0) {
        values.push(id);
        await client.query(
          `UPDATE movies SET ${sets.join(', ')} WHERE id = $${values.length}`,
          values
        );
      }

      return getMovieById(client, id);
    });
  } catch (err) {
    throw translateDbError(err);
  }
}

module.exports = { listMovies, createMovie, updateMovie };