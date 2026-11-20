const AppError = require('../errors/AppError');

function throwIfErrors(errors) {
  if (errors.length > 0) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid request data', errors);
  }
}

function checkTitle(value, errors) {
  if (typeof value !== 'string' || value.trim().length === 0 || value.trim().length > 255) {
    errors.push('title must be a non-empty string (max 255 characters)');
    return undefined;
  }
  return value.trim();
}

function checkReleaseYear(value, errors) {
  if (!Number.isInteger(value) || value < 1888 || value > 2100) {
    errors.push('releaseYear must be an integer between 1888 and 2100');
    return undefined;
  }
  return value;
}

function checkRuntime(value, errors) {
  if (!Number.isInteger(value) || value < 1 || value > 300) {
    errors.push('runtimeMinutes must be an integer between 1 and 300');
    return undefined;
  }
  return value;
}

function checkWatched(value, errors) {
  if (typeof value !== 'boolean') {
    errors.push('watched must be true or false');
    return undefined;
  }
  return value;
}

function checkPrerequisites(value, errors) {
  if (!Array.isArray(value) || !value.every((id) => Number.isInteger(id) && id > 0)) {
    errors.push('prerequisites must be an array of movie ids (positive integers)');
    return undefined;
  }
  return [...new Set(value)]; // remove duplicate ids
}

function validateCreateMovie(body) {
  const input = body || {};
  const errors = [];
  const data = {
    title: checkTitle(input.title, errors),
    releaseYear: checkReleaseYear(input.releaseYear, errors),
    runtimeMinutes: checkRuntime(input.runtimeMinutes, errors),
    watched: input.watched === undefined ? false : checkWatched(input.watched, errors),
    prerequisites:
      input.prerequisites === undefined ? [] : checkPrerequisites(input.prerequisites, errors),
  };
  throwIfErrors(errors);
  return data;
}

function validateUpdateMovie(body) {
  const input = body || {};
  const errors = [];
  const data = {};

  if (input.title !== undefined) data.title = checkTitle(input.title, errors);
  if (input.releaseYear !== undefined) data.releaseYear = checkReleaseYear(input.releaseYear, errors);
  if (input.runtimeMinutes !== undefined) data.runtimeMinutes = checkRuntime(input.runtimeMinutes, errors);
  if (input.watched !== undefined) data.watched = checkWatched(input.watched, errors);
  if (input.prerequisites !== undefined) {
    data.prerequisites = checkPrerequisites(input.prerequisites, errors);
  }

  if (Object.keys(data).length === 0 && errors.length === 0) {
    errors.push('Provide at least one field: title, releaseYear, runtimeMinutes, watched, prerequisites');
  }
  throwIfErrors(errors);
  return data;
}

function validateMovieId(raw) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Movie id must be a positive integer');
  }
  return id;
}

module.exports = { validateCreateMovie, validateUpdateMovie, validateMovieId };