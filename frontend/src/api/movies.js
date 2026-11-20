import { request } from './client';

export const listMovies = () => request('/movies');

export const createMovie = (movie) =>
  request('/movies', { method: 'POST', body: JSON.stringify(movie) });

export const updateMovie = (id, changes) =>
  request(`/movies/${id}`, { method: 'PATCH', body: JSON.stringify(changes) });

export const getRewatchOrder = (id) => request(`/movies/${id}/rewatch-order`);