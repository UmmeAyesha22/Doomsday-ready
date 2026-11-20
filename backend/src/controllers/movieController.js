const movieService = require('../services/movieService');
const {
  validateCreateMovie,
  validateUpdateMovie,
  validateMovieId,
} = require('../validators/movieValidator');

async function createMovie(req, res) {
  const data = validateCreateMovie(req.body);
  const movie = await movieService.createMovie(data);
  res.status(201).json(movie);
}

async function listMovies(req, res) {
  const movies = await movieService.listMovies();
  res.json(movies);
}

async function updateMovie(req, res) {
  const id = validateMovieId(req.params.id);
  const data = validateUpdateMovie(req.body);
  const movie = await movieService.updateMovie(id, data);
  res.json(movie);
}

async function getRewatchOrder(req, res) {
  const id = validateMovieId(req.params.id);
  const result = await movieService.getRewatchOrder(id);
  res.json(result);
}

module.exports = { createMovie, listMovies, updateMovie, getRewatchOrder };