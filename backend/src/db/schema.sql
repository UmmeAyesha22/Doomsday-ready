CREATE TABLE IF NOT EXISTS movies (
  id              SERIAL PRIMARY KEY,
  title           VARCHAR(255) NOT NULL UNIQUE,
  release_year    INTEGER NOT NULL CHECK (release_year BETWEEN 1888 AND 2100),
  runtime_minutes INTEGER NOT NULL CHECK (runtime_minutes BETWEEN 1 AND 300),
  watched         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS movie_prerequisites (
  movie_id        INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  prerequisite_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  PRIMARY KEY (movie_id, prerequisite_id),
  CHECK (movie_id <> prerequisite_id)
);

CREATE TABLE IF NOT EXISTS cinemas (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cinema_bundles (
  cinema_id INTEGER NOT NULL REFERENCES cinemas(id) ON DELETE CASCADE,
  size      INTEGER NOT NULL CHECK (size BETWEEN 1 AND 500),
  PRIMARY KEY (cinema_id, size)
);
