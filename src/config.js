// API configuration for production and local environments
// Defaults to empty string (which uses Vite local proxy) if VITE_API_URL is not defined.
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';
