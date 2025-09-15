// =====================================================
// 🛡️ INPUT VALIDATION & SECURITY UTILITIES
// =====================================================

import { z } from 'zod';

// =====================================================
// VALIDATION SCHEMAS
// =====================================================

// Order validation schema
export const OrderSchema = z.object({
  cafe_id: z.string().uuid('Invalid cafe ID format'),
  items: z.array(z.object({
    menu_item_id: z.string().uuid('Invalid menu item ID format'),
    quantity: z.number().min(1, 'Quantity must be at least 1').max(10, 'Maximum 10 items per order'),
    notes: z.string().max(200, 'Notes cannot exceed 200 characters').optional()
  })).min(1, 'Order must contain at least 1 item').max(20, 'Maximum 20 items per order'),
  special_instructions: z.string().max(500, 'Special instructions cannot exceed 500 characters').optional()
});

// Profile validation schema
export const ProfileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  student_id: z.string().regex(/^[A-Z0-9]{8,12}$/, 'Invalid student ID format').optional(),
  block: z.enum(['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7']),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number format').optional()
});

// Menu item validation schema
export const MenuItemSchema = z.object({
  name: z.string().min(2, 'Item name must be at least 2 characters').max(100, 'Item name cannot exceed 100 characters'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  price: z.number().min(0.01, 'Price must be greater than 0').max(10000, 'Price cannot exceed ₹10,000'),
  category: z.string().min(2, 'Category must be at least 2 characters').max(50, 'Category cannot exceed 50 characters'),
  preparation_time: z.number().min(1, 'Preparation time must be at least 1 minute').max(120, 'Preparation time cannot exceed 120 minutes').optional()
});

// Cafe validation schema
export const CafeSchema = z.object({
  name: z.string().min(2, 'Cafe name must be at least 2 characters').max(100, 'Cafe name cannot exceed 100 characters'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  location: z.string().min(5, 'Location must be at least 5 characters').max(200, 'Location cannot exceed 200 characters'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number format'),
  hours: z.string().min(10, 'Hours must be properly formatted').max(100, 'Hours cannot exceed 100 characters')
});

// =====================================================
// SECURITY UTILITIES
// =====================================================

// Sanitize user input to prevent XSS
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// Validate and sanitize text input
export const validateAndSanitizeText = (input: string, maxLength: number = 500): string => {
  const sanitized = sanitizeInput(input);
  return sanitized.length > maxLength ? sanitized.substring(0, maxLength) : sanitized;
};

// Check for suspicious patterns
export const detectSuspiciousInput = (input: string): { isSuspicious: boolean; reason?: string } => {
  const suspiciousPatterns = [
    { pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, reason: 'Credit card number detected' },
    { pattern: /\b\d{10}\b/, reason: 'Phone number in text field' },
    { pattern: /<script/i, reason: 'Script tag detected' },
    { pattern: /javascript:/i, reason: 'JavaScript protocol detected' },
    { pattern: /on\w+\s*=/i, reason: 'Event handler detected' },
    { pattern: /eval\s*\(/i, reason: 'Eval function detected' },
    { pattern: /alert\s*\(/i, reason: 'Alert function detected' }
  ];

  for (const { pattern, reason } of suspiciousPatterns) {
    if (pattern.test(input)) {
      return { isSuspicious: true, reason };
    }
  }

  return { isSuspicious: false };
};

// Rate limiting utility
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Get existing requests for this identifier
    const requests = this.requests.get(identifier) || [];
    
    // Filter out old requests
    const recentRequests = requests.filter(time => time > windowStart);
    
    // Check if under limit
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const requests = this.requests.get(identifier) || [];
    const recentRequests = requests.filter(time => time > windowStart);
    return Math.max(0, this.maxRequests - recentRequests.length);
  }
}

// =====================================================
// VALIDATION FUNCTIONS
// =====================================================

// Validate order data
export const validateOrder = (data: unknown) => {
  try {
    return OrderSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
};

// Validate profile data
export const validateProfile = (data: unknown) => {
  try {
    return ProfileSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
};

// Validate menu item data
export const validateMenuItem = (data: unknown) => {
  try {
    return MenuItemSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
};

// Validate cafe data
export const validateCafe = (data: unknown) => {
  try {
    return CafeSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
};

// =====================================================
// SECURITY MONITORING
// =====================================================

export class SecurityMonitor {
  private static instance: SecurityMonitor;
  private events: Array<{ timestamp: Date; event: string; details: any }> = [];

  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  logSecurityEvent(event: string, details: any = {}) {
    this.events.push({
      timestamp: new Date(),
      event,
      details
    });

    // Log to console in development
    if (import.meta.env.DEV) {
      console.warn(`🚨 Security Event: ${event}`, details);
    }

    // Keep only last 100 events
    if (this.events.length > 100) {
      this.events = this.events.slice(-100);
    }
  }

  getRecentEvents(minutes: number = 60): Array<{ timestamp: Date; event: string; details: any }> {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.events.filter(event => event.timestamp > cutoff);
  }

  detectAnomalies(userId: string, action: string, data: any) {
    const recentEvents = this.getRecentEvents(15);
    const userEvents = recentEvents.filter(event => 
      event.details.userId === userId || event.details.user_id === userId
    );

    // Check for excessive activity
    if (userEvents.length > 50) {
      this.logSecurityEvent('EXCESSIVE_ACTIVITY', {
        userId,
        action,
        eventCount: userEvents.length,
        timeframe: '15 minutes'
      });
    }

    // Check for suspicious input
    const suspiciousCheck = detectSuspiciousInput(JSON.stringify(data));
    if (suspiciousCheck.isSuspicious) {
      this.logSecurityEvent('SUSPICIOUS_INPUT', {
        userId,
        action,
        reason: suspiciousCheck.reason,
        data: sanitizeInput(JSON.stringify(data))
      });
    }
  }
}

// =====================================================
// EXPORTS
// =====================================================

export const securityMonitor = SecurityMonitor.getInstance();
export const rateLimiter = new RateLimiter();

// Type exports
export type OrderData = z.infer<typeof OrderSchema>;
export type ProfileData = z.infer<typeof ProfileSchema>;
export type MenuItemData = z.infer<typeof MenuItemSchema>;
export type CafeData = z.infer<typeof CafeSchema>;