const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const movieController = require('../controllers/movieController');

const router = express.Router();

router.post('/', asyncHandler(movieController.createMovie));
router.get('/', asyncHandler(movieController.listMovies));
router.patch('/:id', asyncHandler(movieController.updateMovie));

module.exports = router;