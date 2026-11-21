export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const PRODUCTION_API_URL = 'https://doomsday-ready-vxwd.onrender.com';
const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? PRODUCTION_API_URL : '');

// Calls the backend (the Vite proxy forwards /api to port 3000)
export async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = data && data.error;
    throw new ApiError(
      response.status,
      error && error.code,
      (error && error.message) || 'Request failed',
      error && error.details
    );
  }
  return data;
}

// Turns an error into a message we can show on screen
export function describeError(err) {
  if (err.details && err.details.length > 0) {
    return `${err.message}: ${err.details.join('; ')}`;
  }
  return err.message;
}