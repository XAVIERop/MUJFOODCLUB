// Time-based order restrictions utility

/**
 * Check if dine-in and takeaway orders are allowed based on current time
 * @returns {boolean} true if dine-in/takeaway is allowed, false otherwise
 */
export function isDineInTakeawayAllowed(): boolean {
  // TEMPORARILY DISABLED FOR TESTING - Always allow dine-in and takeaway
  return true;
  
  // Original time restriction (commented out for testing):
  // const now = new Date();
  // const currentHour = now.getHours();
  // return currentHour >= 11 && currentHour < 23;
}

/**
 * Get the next available time for dine-in/takeaway orders
 * @returns {string} Next available time (e.g., "11:00 AM")
 */
export function getNextAvailableTime(): string {
  const now = new Date();
  const currentHour = now.getHours();
  
  if (currentHour < 11) {
    // Before 11 AM, next available is 11 AM today
    return "11:00 AM";
  } else {
    // After 11 PM, next available is 11 AM tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(11, 0, 0, 0);
    return "11:00 AM tomorrow";
  }
}

/**
 * Get a user-friendly message about dine-in/takeaway availability
 * @returns {string} Message about availability
 */
export function getDineInTakeawayMessage(): string {
  if (isDineInTakeawayAllowed()) {
    return "Dine-in and takeaway orders are currently available";
  } else {
    return `Dine-in and takeaway orders are currently unavailable. Available from ${getNextAvailableTime()}`;
  }
}

/**
 * Check if delivery orders are allowed (always allowed)
 * @returns {boolean} Always true for delivery
 */
export function isDeliveryAllowed(): boolean {
  return true;
}






