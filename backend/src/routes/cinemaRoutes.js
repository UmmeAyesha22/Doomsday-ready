const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const cinemaController = require('../controllers/cinemaController');

const router = express.Router();

router.post('/', asyncHandler(cinemaController.createCinema));
router.get('/', asyncHandler(cinemaController.listCinemas));

module.exports = router;