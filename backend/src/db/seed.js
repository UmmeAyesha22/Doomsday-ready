const movieService = require('../services/movieService');
const cinemaService = require('../services/cinemaService');
const db = require('./index');

const cinemas = [
  { name: 'Cineplex A', bundleSizes: [1, 3, 4] },
  { name: 'Cineplex B', bundleSizes: [2, 5] },
  { name: 'Cineplex C', bundleSizes: [6, 9, 20] },
  { name: 'Cineplex D', bundleSizes: [4, 6] },
];

// Prerequisites are listed by title. A movie must come after its prerequisites.
const movies = [
  { title: 'Iron Man', releaseYear: 2008, runtimeMinutes: 126, prerequisites: [] },
  { title: 'Captain America: The First Avenger', releaseYear: 2011, runtimeMinutes: 124, prerequisites: [] },
  { title: 'The Avengers', releaseYear: 2012, runtimeMinutes: 143, prerequisites: ['Iron Man', 'Captain America: The First Avenger'] },
  { title: 'Captain America: Civil War', releaseYear: 2016, runtimeMinutes: 147, prerequisites: ['The Avengers'] },
  { title: 'Thor: Ragnarok', releaseYear: 2017, runtimeMinutes: 130, prerequisites: [] },
  { title: 'Avengers: Infinity War', releaseYear: 2018, runtimeMinutes: 149, prerequisites: ['Captain America: Civil War', 'Thor: Ragnarok'] },
  { title: 'Avengers: Endgame', releaseYear: 2019, runtimeMinutes: 181, prerequisites: ['Avengers: Infinity War'] },
  { title: 'Avengers: Doomsday', releaseYear: 2026, runtimeMinutes: 150, prerequisites: ['Avengers: Endgame'] },
];

async function seedCinemas() {
  for (const cinema of cinemas) {
    try {
      await cinemaService.createCinema(cinema);
      console.log(`Added cinema: ${cinema.name}`);
    } catch (err) {
      if (err.code === 'DUPLICATE_NAME') console.log(`Skipped cinema (exists): ${cinema.name}`);
      else throw err;
    }
  }
}

async function seedMovies() {
  const existing = await movieService.listMovies();
  const idByTitle = new Map(existing.map((m) => [m.title, m.id]));

  for (const movie of movies) {
    if (idByTitle.has(movie.title)) {
      console.log(`Skipped movie (exists): ${movie.title}`);
      continue;
    }
    const created = await movieService.createMovie({
      title: movie.title,
      releaseYear: movie.releaseYear,
      runtimeMinutes: movie.runtimeMinutes,
      watched: false,
      prerequisites: movie.prerequisites.map((title) => idByTitle.get(title)),
    });
    idByTitle.set(created.title, created.id);
    console.log(`Added movie: ${movie.title}`);
  }
}

async function seed() {
  await seedCinemas();
  await seedMovies();
}

seed()
  .catch((err) => {
    console.error('Seeding failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => db.pool.end());