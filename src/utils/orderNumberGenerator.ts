import { supabase } from '@/integrations/supabase/client';

/**
 * Generates a daily reset order number using the database function
 * Format: {CAFE_PREFIX}{6_DIGIT_NUMBER} (e.g., CHA000001, FC000001)
 * 
 * @param cafeId - The UUID of the cafe
 * @returns Promise<string> - The generated order number
 */
export const generateDailyOrderNumber = async (cafeId: string): Promise<string> => {
  try {
    console.log('🔄 Generating daily order number for cafe:', cafeId);
    
    // Call the database function
    const { data, error } = await supabase.rpc('generate_daily_order_number', {
      p_cafe_id: cafeId
    });
    
    if (error) {
      console.error('❌ Error generating order number:', error);
      throw new Error(`Failed to generate order number: ${error.message}`);
    }
    
    if (!data) {
      throw new Error('No order number generated');
    }
    
    console.log('✅ Generated order number:', data);
    return data;
  } catch (error) {
    console.error('❌ Order number generation failed:', error);
    
    // Fallback to old system if database function fails
    console.log('🔄 Falling back to legacy order number generation...');
    return generateLegacyOrderNumber();
  }
};

/**
 * Legacy order number generation (fallback)
 * This is the old system that was used before
 */
const generateLegacyOrderNumber = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 8).toUpperCase();
  const userSuffix = 'LEGACY';
  return `LEGACY-${timestamp}-${random}-${userSuffix}`;
};

/**
 * Validates if an order number follows the new daily format
 * @param orderNumber - The order number to validate
 * @returns boolean - True if valid daily format
 */
export const isValidDailyOrderNumber = (orderNumber: string): boolean => {
  // Pattern: 3 letters + 6 digits (e.g., CHA000001, FC000001)
  return /^[A-Z]{3}[0-9]{6}$/.test(orderNumber);
};

/**
 * Gets the cafe prefix from an order number
 * @param orderNumber - The order number
 * @returns string - The cafe prefix (e.g., "CHA", "FC")
 */
export const getCafePrefixFromOrderNumber = (orderNumber: string): string => {
  if (isValidDailyOrderNumber(orderNumber)) {
    return orderNumber.substring(0, 3);
  }
  return 'UNK'; // Unknown
};

/**
 * Gets the order sequence number from a daily order number
 * @param orderNumber - The order number
 * @returns number - The sequence number (e.g., 1, 2, 3)
 */
export const getOrderSequenceNumber = (orderNumber: string): number => {
  if (isValidDailyOrderNumber(orderNumber)) {
    return parseInt(orderNumber.substring(3), 10);
  }
  return 0;
};
