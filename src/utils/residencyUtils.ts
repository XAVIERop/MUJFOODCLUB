// Utility functions for handling user residency and cafe scope

export const MUJ_EMAIL_DOMAIN = '@muj.manipal.edu';
export const FOODCLUB_EMAIL_DOMAIN = '@mujfoodclub.in';

/**
 * Get user's residency scope from their profile
 * @param profile - User profile object
 * @returns 'ghs' | 'off_campus' | null
 */
export function getUserResidency(profile: any): 'ghs' | 'off_campus' | null {
  if (!profile) return null;
  
  // Check if user has residency_scope field
  if (profile.residency_scope) {
    return profile.residency_scope;
  }
  
  // Fallback: Check email domain
  if (profile.email?.endsWith(MUJ_EMAIL_DOMAIN)) {
    return 'ghs'; // MUJ students are on campus
  }
  
  if (profile.email?.endsWith(FOODCLUB_EMAIL_DOMAIN)) {
    return 'off_campus'; // Cafe accounts are off campus
  }
  
  return null;
}

/**
 * Check if user is an off-campus user
 * @param profile - User profile object
 * @returns boolean
 */
export function isOffCampusUser(profile: any): boolean {
  if (!profile) return false;
  const residency = getUserResidency(profile);
  return residency === 'off_campus';
}

/**
 * Check if cafe is an off-campus cafe
 * @param cafe - Cafe object
 * @returns boolean
 */
export function isOffCampusCafe(cafe: any): boolean {
  if (!cafe) return false;
  
  // Check if cafe has location_scope field (if it exists in schema)
  // For now, we'll check based on cafe name or other indicators
  // This might need to be updated based on your actual cafe data structure
  
  // Common off-campus cafe indicators
  const offCampusCafes = [
    'banna',
    'chowki',
    'amor',
    'koko',
    'ro',
    'bg',
    'food cart'
  ];
  
  const cafeName = cafe.name?.toLowerCase() || cafe.slug?.toLowerCase() || '';
  return offCampusCafes.some(indicator => cafeName.includes(indicator));
}

/**
 * Get cafe's scope
 * @param cafe - Cafe object
 * @returns 'ghs' | 'off_campus'
 */
export function getCafeScope(cafe: any): 'ghs' | 'off_campus' {
  if (isOffCampusCafe(cafe)) {
    return 'off_campus';
  }
  return 'ghs';
}

/**
 * Check if user should be able to order from a specific cafe
 * @param userProfile - User profile object (can be null for guest orders)
 * @param cafe - Cafe object
 * @returns boolean
 */
export function shouldUserOrderFromCafe(userProfile: any, cafe: any): boolean {
  if (!cafe) return false;
  
  // For guest orders (null profile), allow ordering from off-campus cafes only
  // This enables guest ordering for Banna's Chowki dine-in
  if (!userProfile) {
    return isOffCampusCafe(cafe);
  }
  
  const userResidency = getUserResidency(userProfile);
  const cafeScope = getCafeScope(cafe);
  
  // If user is off-campus, they can order from any cafe
  if (userResidency === 'off_campus') {
    return true;
  }
  
  // If user is on-campus (ghs), they can order from on-campus cafes
  if (userResidency === 'ghs' && cafeScope === 'ghs') {
    return true;
  }
  
  // On-campus users can also order from off-campus cafes (if allowed)
  // This can be changed based on business rules
  return true;
}

/**
 * Check if user should see a cafe in the cafe list
 * @param userProfile - User profile object
 * @param cafe - Cafe object
 * @returns boolean
 */
export function shouldUserSeeCafe(userProfile: any, cafe: any): boolean {
  if (!cafe) return false;
  
  // If no user profile, show all cafes
  if (!userProfile) {
    return true;
  }
  
  // All users with @muj.manipal.edu or @mujfoodclub.in should see all cafes
  const email = userProfile.email || '';
  if (email.endsWith(MUJ_EMAIL_DOMAIN) || email.endsWith(FOODCLUB_EMAIL_DOMAIN)) {
    return true;
  }
  
  // Default: show all cafes
  return true;
}
