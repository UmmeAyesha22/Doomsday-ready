import { request } from './client';

export const listCinemas = () => request('/cinemas');

export const createCinema = (cinema) =>
  request('/cinemas', { method: 'POST', body: JSON.stringify(cinema) });

export const getBookingQuote = (id, groupSize) =>
  request(`/cinemas/${id}/booking?groupSize=${encodeURIComponent(groupSize)}`);
