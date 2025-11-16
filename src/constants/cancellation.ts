// Cancellation constants

/**
 * Cafe cancellation password
 * Reads from environment variable VITE_CAFE_CANCELLATION_PASSWORD
 * Falls back to 'cafe123' for development if not set
 * 
 * In production, set VITE_CAFE_CANCELLATION_PASSWORD in your environment variables
 */
export const CAFE_CANCELLATION_PASSWORD = 
  import.meta.env.VITE_CAFE_CANCELLATION_PASSWORD || 'cafe123';

