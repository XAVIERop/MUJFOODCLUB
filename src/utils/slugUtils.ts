// Utility functions for generating URL-friendly slugs

/**
 * Generate a URL-friendly slug from a string (combining words without hyphens)
 * @param text - The text to convert to a slug
 * @returns URL-friendly slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters except spaces
    .replace(/\s+/g, ''); // Remove all spaces (combine words)
}

/**
 * Generate a slug for a cafe name
 * @param cafeName - The cafe name to convert to a slug
 * @returns URL-friendly cafe slug
 */
export function generateCafeSlug(cafeName: string): string {
  return generateSlug(cafeName);
}

/**
 * Validate if a string is a valid slug
 * @param slug - The slug to validate
 * @returns true if valid slug
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug) && slug.length > 0;
}

/**
 * Convert a slug back to a readable name
 * @param slug - The slug to convert
 * @returns Readable name
 */
export function slugToName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Example usage:
// generateCafeSlug("CHATKARA") -> "chatkara"
// generateCafeSlug("FOOD COURT") -> "foodcourt"
// generateCafeSlug("COOK HOUSE") -> "cookhouse"
// generateCafeSlug("STARDOM Café & Lounge") -> "stardomcafelounge"
