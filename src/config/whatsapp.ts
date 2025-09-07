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

// WhatsApp Business API (Meta) Configuration
export const META_WHATSAPP_CONFIG = {
  ACCESS_TOKEN: import.meta.env.VITE_META_WHATSAPP_ACCESS_TOKEN || '',
  PHONE_NUMBER_ID: import.meta.env.VITE_META_WHATSAPP_PHONE_NUMBER_ID || '',
  BUSINESS_ACCOUNT_ID: import.meta.env.VITE_META_WHATSAPP_BUSINESS_ACCOUNT_ID || '',
};
