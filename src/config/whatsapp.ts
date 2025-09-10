// WhatsApp API Configuration
export const WHATSAPP_CONFIG = {
  // Twilio WhatsApp API Configuration
  TWILIO_ACCOUNT_SID: import.meta.env.VITE_TWILIO_ACCOUNT_SID || '',
  TWILIO_AUTH_TOKEN: import.meta.env.VITE_TWILIO_AUTH_TOKEN || '',
  TWILIO_WHATSAPP_FROM: import.meta.env.VITE_TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886',
  
  // For testing, use Twilio's sandbox number
  // For production, use your actual WhatsApp Business number
  SANDBOX_MODE: import.meta.env.VITE_WHATSAPP_SANDBOX_MODE === 'true',
};

// Validate WhatsApp configuration
export const validateWhatsAppConfig = () => {
  const errors: string[] = [];
  
  if (!WHATSAPP_CONFIG.TWILIO_ACCOUNT_SID) {
    errors.push('VITE_TWILIO_ACCOUNT_SID environment variable is not set');
  }
  
  if (!WHATSAPP_CONFIG.TWILIO_AUTH_TOKEN) {
    errors.push('VITE_TWILIO_AUTH_TOKEN environment variable is not set');
  }
  
  if (!WHATSAPP_CONFIG.TWILIO_WHATSAPP_FROM) {
    errors.push('VITE_TWILIO_WHATSAPP_FROM environment variable is not set');
  }
  
  if (errors.length > 0) {
    console.error('WhatsApp configuration errors:', errors);
    return false;
  }
  
  return true;
};

// Debug: Log environment variables on load
console.log('🔍 WhatsApp Config Debug:');
console.log('TWILIO_ACCOUNT_SID:', WHATSAPP_CONFIG.TWILIO_ACCOUNT_SID ? '✅ Set' : '❌ Missing');
console.log('TWILIO_AUTH_TOKEN:', WHATSAPP_CONFIG.TWILIO_AUTH_TOKEN ? '✅ Set' : '❌ Missing');
console.log('TWILIO_WHATSAPP_FROM:', WHATSAPP_CONFIG.TWILIO_WHATSAPP_FROM || '❌ Missing');
console.log('Raw env vars:', {
  VITE_TWILIO_ACCOUNT_SID: import.meta.env.VITE_TWILIO_ACCOUNT_SID,
  VITE_TWILIO_AUTH_TOKEN: import.meta.env.VITE_TWILIO_AUTH_TOKEN,
  VITE_TWILIO_WHATSAPP_FROM: import.meta.env.VITE_TWILIO_WHATSAPP_FROM
});

// WhatsApp Business API (Meta) Configuration
export const META_WHATSAPP_CONFIG = {
  ACCESS_TOKEN: import.meta.env.VITE_META_WHATSAPP_ACCESS_TOKEN || '',
  PHONE_NUMBER_ID: import.meta.env.VITE_META_WHATSAPP_PHONE_NUMBER_ID || '',
  BUSINESS_ACCOUNT_ID: import.meta.env.VITE_META_WHATSAPP_BUSINESS_ACCOUNT_ID || '',
};
