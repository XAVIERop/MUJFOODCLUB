// WhatsApp API Configuration - Aisensy
export const WHATSAPP_CONFIG = {
  // Aisensy WhatsApp Business API Configuration
  AISENSY_API_KEY: import.meta.env.VITE_AISENSY_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZjlmYjkxNTZhZTgwMGQ1MzFhNWEzZSIsIm5hbWUiOiJGb29kIENsdWIgNzUwNSIsImFwcE5hbWUiOiJBaVNlbnN5IiwiY2xpZW50SWQiOiI2OGY5ZmI5MTU2YWU4MDBkNTMxYTVhMzkiLCJhY3RpdmVQbGFuIjoiRlJFRV9GT1JFVkVSIiwiaWF0IjoxNzYxMjEzMzI5fQ.vuy89L_rMu5jqcQpwQCcp-hlNWTh8M1psPXr5qUwu1s',
  AISENSY_PHONE_NUMBER: import.meta.env.VITE_AISENSY_PHONE_NUMBER || '+919625851220',
  AISENSY_API_BASE_URL: import.meta.env.VITE_AISENSY_API_BASE_URL || 'https://backend.aisensy.com',
};

// Validate WhatsApp configuration
export const validateWhatsAppConfig = () => {
  const errors: string[] = [];
  
  if (!WHATSAPP_CONFIG.AISENSY_API_KEY) {
    errors.push('VITE_AISENSY_API_KEY environment variable is not set');
  }
  
  if (!WHATSAPP_CONFIG.AISENSY_PHONE_NUMBER) {
    errors.push('VITE_AISENSY_PHONE_NUMBER environment variable is not set');
  }
  
  if (errors.length > 0) {
    console.error('WhatsApp configuration errors:', errors);
    return false;
  }
  
  return true;
};

// Debug: Log environment variables on load
console.log('🔍 WhatsApp Config Debug (Aisensy):');
console.log('AISENSY_API_KEY:', WHATSAPP_CONFIG.AISENSY_API_KEY ? '✅ Set' : '❌ Missing');
console.log('AISENSY_PHONE_NUMBER:', WHATSAPP_CONFIG.AISENSY_PHONE_NUMBER || '❌ Missing');
console.log('AISENSY_API_BASE_URL:', WHATSAPP_CONFIG.AISENSY_API_BASE_URL || '❌ Missing');

// WhatsApp Business API (Meta) Configuration
export const META_WHATSAPP_CONFIG = {
  ACCESS_TOKEN: import.meta.env.VITE_META_WHATSAPP_ACCESS_TOKEN || '',
  PHONE_NUMBER_ID: import.meta.env.VITE_META_WHATSAPP_PHONE_NUMBER_ID || '',
  BUSINESS_ACCOUNT_ID: import.meta.env.VITE_META_WHATSAPP_BUSINESS_ACCOUNT_ID || '',
};
