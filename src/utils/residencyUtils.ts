// Utility functions for handling user residency and cafe scope

export const MUJ_EMAIL_DOMAIN = '@muj.manipal.edu';
export const FOODCLUB_EMAIL_DOMAIN = '@mujfoodclub.in';

/**
 * Get user's residency scope from their profile
 * @param profile - User profile object (with email and residency_scope fields) or email string
 * @returns { scope: 'ghs' | 'off_campus', canSeeGHSContent: boolean }
 */
export function getUserResidency(profileOrEmail: any): { scope: 'ghs' | 'off_campus', canSeeGHSContent: boolean } {
  // Handle both profile object and email string
  const email = typeof profileOrEmail === 'string' 
    ? profileOrEmail 
    : profileOrEmail?.email;
  
  if (!email) {
    return { scope: 'off_campus', canSeeGHSContent: false };
  }
  
  // @mujfoodclub.in accounts have FULL access to all cafes (always GHS scope)
  if (email.endsWith(FOODCLUB_EMAIL_DOMAIN)) {
    return { scope: 'ghs', canSeeGHSContent: true };
  }
  
  // If profile object provided, check residency_scope field FIRST (most authoritative)
  if (profileOrEmail && typeof profileOrEmail === 'object' && profileOrEmail.residency_scope) {
    const residencyScope = profileOrEmail.residency_scope;
    if (residencyScope === 'ghs') {
      return { scope: 'ghs', canSeeGHSContent: true };
    } else if (residencyScope === 'off_campus') {
      return { scope: 'off_campus', canSeeGHSContent: false };
    }
  }
  
  // For @muj.manipal.edu emails, check the profile's residency_scope field
  // This allows same domain users to have different access based on where they live
  if (email.endsWith(MUJ_EMAIL_DOMAIN)) {
    // If residency_scope is null/undefined, default to GHS for @muj.manipal.edu
    // (backward compatibility for existing users without residency_scope set)
    return { scope: 'ghs', canSeeGHSContent: true };
  }
  
  // All other emails (Gmail, Yahoo, etc.) are off-campus users
  return { scope: 'off_campus', canSeeGHSContent: false };
}

/**
 * Check if user is an off-campus user
 * @param profile - User profile object or email string
 * @returns boolean
 */
export function isOffCampusUser(profile: any): boolean {
  if (!profile) return false;
  const { scope } = getUserResidency(profile);
  return scope === 'off_campus';
}

/**
 * Check if cafe is an off-campus cafe
 * @param cafe - Cafe object (should have location_scope field)
 * @returns boolean
 */
export function isOffCampusCafe(cafe: any): boolean {
  if (!cafe) return false;
  
  // Check cafe's location_scope field from database
  // This is the authoritative source, not cafe names
  if (cafe.location_scope === 'off_campus') {
    return true;
  }
  
  // Default to GHS if location_scope is not set or is 'ghs'
  return false;
}

/**
 * Get cafe's scope
 * @param cafe - Cafe object (should have location_scope field)
 * @returns 'ghs' | 'off_campus'
 */
export function getCafeScope(cafe: any): 'ghs' | 'off_campus' {
  if (!cafe) return 'ghs'; // Default to GHS if cafe not found
  
  // Use location_scope field from database
  if (cafe.location_scope === 'off_campus') {
    return 'off_campus';
  }
  
  // Default to GHS if location_scope is null, undefined, or 'ghs'
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
  
  const cafeScope = getCafeScope(cafe);
  
  // For guest orders (null profile), allow ordering from off-campus cafes only
  // This enables guest ordering for Banna's Chowki dine-in and table orders
  if (!userProfile) {
    return cafeScope === 'off_campus';
  }
  
  const userResidency = getUserResidency(userProfile);
  
  // GHS users (including @mujfoodclub.in and GHS @muj.manipal.edu) can order from ALL cafes
  if (userResidency.scope === 'ghs') {
    return true; // GHS users can order from both GHS and off-campus cafes
  }
  
  // Off-campus users can ONLY order from off-campus cafes
  if (userResidency.scope === 'off_campus') {
    return cafeScope === 'off_campus';
  }
  
  // Default: deny access
  return false;
}

/**
 * Check if user should see a cafe in the cafe list
 * @param userProfile - User profile object (can be null for guests)
 * @param cafe - Cafe object (should have location_scope field)
 * @returns boolean
 */
export function shouldUserSeeCafe(userProfile: any, cafe: any): boolean {
  if (!cafe) return false;
  
  // For guests (not signed up), show ALL cafes
  // This allows browsing before signup
  if (!userProfile) {
    return true;
  }
  
  const userResidency = getUserResidency(userProfile);
  const cafeScope = getCafeScope(cafe);
  
  // GHS users (including @mujfoodclub.in and GHS @muj.manipal.edu) can see ALL cafes
  if (userResidency.scope === 'ghs') {
    return true; // GHS users can see both GHS and off-campus cafes
  }
  
  // Off-campus users can ONLY see off-campus cafes
  if (userResidency.scope === 'off_campus') {
    return cafeScope === 'off_campus';
  }
  
  // Default: deny access
  return false;
}
