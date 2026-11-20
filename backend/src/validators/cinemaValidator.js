const AppError = require('../errors/AppError');

function validateCreateCinema(body) {
  const input = body || {};
  const errors = [];

  // name: required, unique is checked by the database
  let name;
  if (
    typeof input.name !== 'string' ||
    input.name.trim().length === 0 ||
    input.name.trim().length > 255
  ) {
    errors.push('name must be a non-empty string (max 255 characters)');
  } else {
    name = input.name.trim();
  }

  // bundleSizes: 1 to 10 different integers, each between 1 and 500
  const sizes = input.bundleSizes;
  if (!Array.isArray(sizes)) {
    errors.push('bundleSizes must be an array of numbers');
  } else {
    if (sizes.length < 1 || sizes.length > 10) {
      errors.push('bundleSizes must contain between 1 and 10 sizes');
    }
    if (!sizes.every((size) => Number.isInteger(size) && size >= 1 && size <= 500)) {
      errors.push('each bundle size must be an integer between 1 and 500');
    }
    if (new Set(sizes).size !== sizes.length) {
      errors.push('bundle sizes must all be different');
    }
  }

  if (errors.length > 0) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid request data', errors);
  }

  return { name, bundleSizes: [...sizes].sort((a, b) => a - b) };
}

function validateCinemaId(raw) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Cinema id must be a positive integer');
  }
  return id;
}

module.exports = { validateCreateCinema, validateCinemaId };