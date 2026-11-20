const cinemaService = require('../services/cinemaService');
const { validateCreateCinema } = require('../validators/cinemaValidator');

async function createCinema(req, res) {
  const data = validateCreateCinema(req.body);
  const cinema = await cinemaService.createCinema(data);
  res.status(201).json(cinema);
}

async function listCinemas(req, res) {
  const cinemas = await cinemaService.listCinemas();
  res.json(cinemas);
}

module.exports = { createCinema, listCinemas };