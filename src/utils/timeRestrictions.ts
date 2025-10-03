// Time-based order restrictions utility

/**
 * Check if dine-in and takeaway orders are allowed based on current time
 * Dine-in and takeaway are only allowed from 11 AM to 11 PM
 * @returns {boolean} true if dine-in/takeaway is allowed, false otherwise
 */
export function isDineInTakeawayAllowed(): boolean {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute; // Convert to minutes for easier comparison
  
  // Dine-in/Takeaway window: 11 AM (11:00) to 11 PM (23:00)
  const startTime = 11 * 60; // 11 AM in minutes
  const endTime = 23 * 60; // 11 PM in minutes
  
  // Check if current time is within the allowed window
  return currentTime >= startTime && currentTime <= endTime;
}

/**
 * Get the next available time for dine-in/takeaway orders
 * @returns {string} Next available time (e.g., "11:00 AM")
 */
export function getNextAvailableTime(): string {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;
  
  const startTime = 11 * 60; // 11 AM in minutes
  const endTime = 23 * 60; // 11 PM in minutes
  
  if (currentTime < startTime) {
    // Before 11 AM, next available is 11 AM today
    return "11:00 AM today";
  } else if (currentTime > endTime) {
    // After 11 PM, next available is 11 AM tomorrow
    return "11:00 AM tomorrow";
  } else {
    // Currently within allowed hours, but this shouldn't happen if function is called
    return "11:00 AM today";
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
 * Check if delivery orders are allowed based on current time
 * Delivery is only allowed from 11 PM to 2:30 AM
 * @returns {boolean} true if delivery is allowed, false otherwise
 */
export function isDeliveryAllowed(): boolean {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute; // Convert to minutes for easier comparison
  
  // Delivery window: 11 PM (23:00) to 2:30 AM (02:30)
  const deliveryStart = 23 * 60; // 11 PM in minutes
  const deliveryEnd = 2 * 60 + 30; // 2:30 AM in minutes
  
  // Check if current time is within delivery window
  // Handle the case where delivery window crosses midnight
  if (currentHour >= 23) {
    // After 11 PM, delivery is allowed until 2:30 AM next day
    return currentTime >= deliveryStart || currentTime <= deliveryEnd;
  } else {
    // Before 11 PM, check if it's in the early morning window (12 AM - 2:30 AM)
    return currentTime <= deliveryEnd;
  }
}

/**
 * Get the next available delivery time
 * @returns {string} Next available delivery time (e.g., "11:00 PM")
 */
export function getNextDeliveryTime(): string {
  const now = new Date();
  const currentHour = now.getHours();
  
  if (currentHour < 23) {
    // Before 11 PM, next delivery is 11 PM today
    return "11:00 PM";
  } else {
    // After 2:30 AM, next delivery is 11 PM today
    return "11:00 PM today";
  }
}

/**
 * Get a user-friendly message about delivery availability
 * @returns {string} Message about delivery availability
 */
export function getDeliveryMessage(): string {
  if (isDeliveryAllowed()) {
    return "Delivery orders are currently available";
  } else {
    return `Delivery orders are currently unavailable. Available from ${getNextDeliveryTime()}`;
  }
}






