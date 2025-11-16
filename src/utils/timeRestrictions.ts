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
 * For specific cafes: 11 AM to 2 AM (next day)
 * For other cafes: 11 PM to 2:30 AM
 * @param cafeName - Name of the cafe to check restrictions for
 * @returns {boolean} true if delivery is allowed, false otherwise
 */
export function isDeliveryAllowed(cafeName?: string): boolean {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute; // Convert to minutes for easier comparison
  
  // Check if this cafe has extended delivery hours (11 AM to 2 AM)
  const extendedDeliveryCafes = [
    'cook house', 'taste of india', 'pizza bakers', 'food court', 
    'punjabi tadka', 'munch box', 'mini meals', 'kitchen', 'curry', 'stardom'
  ];
  
  const isExtendedDeliveryCafe = cafeName && extendedDeliveryCafes.some(cafe => 
    cafeName.toLowerCase().includes(cafe)
  );
  
  if (isExtendedDeliveryCafe) {
    // Extended delivery window: 11 AM (11:00) to 2 AM (02:00) next day
    const extendedStart = 11 * 60; // 11 AM in minutes
    const extendedEnd = 2 * 60; // 2 AM in minutes
    
    // Check if current time is within extended delivery window
    if (currentHour >= 11 && currentHour < 24) {
      // Between 11 AM and midnight, delivery is allowed
      return currentTime >= extendedStart;
    } else if (currentHour >= 0 && currentHour < 2) {
      // Between midnight and 2 AM, delivery is allowed
      return currentTime <= extendedEnd;
    } else {
      // Outside extended window (2 AM to 11 AM)
      return false;
    }
  } else {
    // Standard delivery window: 11 PM (23:00) to 2:30 AM (02:30)
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
}

/**
 * Get the next available delivery time
 * @param cafeName - Name of the cafe to check restrictions for
 * @returns {string} Next available delivery time (e.g., "11:00 AM" or "11:00 PM")
 */
export function getNextDeliveryTime(cafeName?: string): string {
  const now = new Date();
  const currentHour = now.getHours();
  
  // Check if this cafe has extended delivery hours (11 AM to 2 AM)
  const extendedDeliveryCafes = [
    'cook house', 'taste of india', 'pizza bakers', 'food court', 
    'punjabi tadka', 'munch box', 'mini meals', 'kitchen', 'curry', 'stardom'
  ];
  
  const isExtendedDeliveryCafe = cafeName && extendedDeliveryCafes.some(cafe => 
    cafeName.toLowerCase().includes(cafe)
  );
  
  if (isExtendedDeliveryCafe) {
    // Extended cafes: Available from 11 AM to 2 AM
    if (currentHour >= 2 && currentHour < 11) {
      // Between 2 AM and 11 AM, next delivery is 11 AM today
      return "11:00 AM today";
    } else {
      // After 2 AM next day or already within delivery hours
      return "11:00 AM";
    }
  } else {
    // Standard cafes: Available from 11 PM to 2:30 AM
    if (currentHour < 23) {
      // Before 11 PM, next delivery is 11 PM today
      return "11:00 PM";
    } else {
      // After 2:30 AM, next delivery is 11 PM today
      return "11:00 PM today";
    }
  }
}

/**
 * Get a user-friendly message about delivery availability
 * @param cafeName - Name of the cafe to check restrictions for
 * @returns {string} Message about delivery availability
 */
export function getDeliveryMessage(cafeName?: string): string {
  if (isDeliveryAllowed(cafeName)) {
    return "Delivery orders are currently available";
  } else {
    return `Delivery orders are currently unavailable. Available from ${getNextDeliveryTime(cafeName)}`;
  }
}






