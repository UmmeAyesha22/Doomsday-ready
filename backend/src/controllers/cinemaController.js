const cinemaService = require('../services/cinemaService');
const {
  validateCreateCinema,
  validateCinemaId,
  validateGroupSize,
} = require('../validators/cinemaValidator');

async function createCinema(req, res) {
  const data = validateCreateCinema(req.body);
  const cinema = await cinemaService.createCinema(data);
  res.status(201).json(cinema);
}

async function listCinemas(req, res) {
  const cinemas = await cinemaService.listCinemas();
  res.json(cinemas);
}

async function getBookingQuote(req, res) {
  const id = validateCinemaId(req.params.id);
  const groupSize = validateGroupSize(req.query.groupSize);
  const quote = await cinemaService.getBookingQuote(id, groupSize);
  res.json(quote);
}

module.exports = { createCinema, listCinemas, getBookingQuote };