/**
 * Central API configuration.
 * Uses the environment variable in production (set in .env.production),
 * and falls back to the local dev server.
 */
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api";

export default API_BASE_URL;
