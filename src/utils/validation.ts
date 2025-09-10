// Input Validation and Sanitization Utilities
// Production-ready validation for all user inputs

import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string()
  .email('Invalid email format')
  .min(1, 'Email is required')
  .max(255, 'Email is too long')
  .refine(
    (email) => email.endsWith('@muj.manipal.edu'),
    'Please use a valid MUJ email address (@muj.manipal.edu)'
  );

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number');

export const phoneSchema = z.string()
  .regex(/^\+91[6-9]\d{9}$/, 'Please enter a valid Indian phone number starting with +91')
  .optional();

export const nameSchema = z.string()
  .min(1, 'Name is required')
  .max(100, 'Name is too long')
  .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces');

export const blockSchema = z.enum([
  'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11', 'B12',
  'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8'
]);

export const orderStatusSchema = z.enum([
  'received', 'confirmed', 'preparing', 'on_the_way', 'completed', 'cancelled'
]);

export const paymentMethodSchema = z.enum([
  'COD', 'UPI', 'CARD', 'WALLET', 'POINTS'
]);

// Order validation schemas
export const orderItemSchema = z.object({
  menu_item_id: z.string().uuid('Invalid menu item ID'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(10, 'Quantity cannot exceed 10'),
  special_instructions: z.string().max(500, 'Special instructions too long').optional(),
  notes: z.string().max(200, 'Notes too long').optional(),
});

export const orderSchema = z.object({
  cafe_id: z.string().uuid('Invalid cafe ID'),
  delivery_block: blockSchema,
  delivery_notes: z.string().max(500, 'Delivery notes too long').optional(),
  payment_method: paymentMethodSchema,
  points_to_redeem: z.number().int().min(0, 'Points cannot be negative').optional(),
  items: z.array(orderItemSchema).min(1, 'At least one item is required').max(20, 'Cannot order more than 20 items'),
});

// Cafe validation schemas
export const cafeSchema = z.object({
  name: z.string().min(1, 'Cafe name is required').max(100, 'Cafe name too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  location: z.string().min(1, 'Location is required').max(200, 'Location too long'),
  phone: z.string().regex(/^\+91[6-9]\d{9}$/, 'Invalid phone number'),
  hours: z.string().min(1, 'Hours are required').max(100, 'Hours format too long'),
  type: z.string().min(1, 'Cafe type is required').max(50, 'Cafe type too long'),
  is_active: z.boolean().optional(),
});

// Menu item validation schemas
export const menuItemSchema = z.object({
  cafe_id: z.string().uuid('Invalid cafe ID'),
  name: z.string().min(1, 'Item name is required').max(100, 'Item name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  price: z.number().positive('Price must be positive').max(10000, 'Price too high'),
  category: z.string().min(1, 'Category is required').max(50, 'Category too long'),
  is_available: z.boolean().optional(),
  preparation_time: z.number().int().min(0, 'Preparation time cannot be negative').max(120, 'Preparation time too long').optional(),
});

// Rating validation schemas
export const ratingSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  review: z.string().max(1000, 'Review too long').optional(),
});

// User profile validation schemas
export const profileSchema = z.object({
  full_name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  block: blockSchema,
  student_id: z.string().max(20, 'Student ID too long').optional(),
});

// Sanitization functions
export const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

export const sanitizeHtml = (input: string): string => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

export const sanitizeNumber = (input: unknown): number | null => {
  const num = Number(input);
  return isNaN(num) ? null : num;
};

export const sanitizeEmail = (input: string): string => {
  return input.toLowerCase().trim();
};

export const sanitizePhone = (input: string): string => {
  return input.replace(/[^\d+]/g, '');
};

// Rate limiting utilities
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 60) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  public isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }

  public getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }

  public reset(identifier: string): void {
    this.requests.delete(identifier);
  }
}

// Create rate limiter instances
export const orderRateLimiter = new RateLimiter(60000, 10); // 10 orders per minute
export const apiRateLimiter = new RateLimiter(60000, 60); // 60 requests per minute
export const authRateLimiter = new RateLimiter(300000, 5); // 5 auth attempts per 5 minutes

// Validation middleware for API calls
export const validateApiRequest = async (
  schema: z.ZodSchema,
  data: unknown,
  rateLimiter?: RateLimiter,
  identifier?: string
): Promise<{ success: boolean; data?: unknown; error?: string }> => {
  try {
    // Check rate limiting
    if (rateLimiter && identifier && !rateLimiter.isAllowed(identifier)) {
      return {
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
      };
    }

    // Validate data
    const validatedData = schema.parse(data);
    
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => e.message).join(', ');
      return {
        success: false,
        error: errorMessage,
      };
    }
    
    return {
      success: false,
      error: 'Validation failed',
    };
  }
};

// Input sanitization middleware
export const sanitizeInput = (data: unknown): unknown => {
  if (typeof data === 'string') {
    return sanitizeString(data);
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return data;
};

// XSS protection
export const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// SQL injection protection (for dynamic queries)
export const escapeSql = (unsafe: string): string => {
  return unsafe
    .replace(/'/g, "''")
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '');
};

// File upload validation
export const validateFileUpload = (
  file: File,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}
): { valid: boolean; error?: string } => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'],
  } = options;

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`,
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  // Check file extension
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `File extension not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`,
    };
  }

  return { valid: true };
};

// Common validation functions
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+91[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.endsWith('@muj.manipal.edu');
};

export const isValidOrderNumber = (orderNumber: string): boolean => {
  const orderRegex = /^[A-Z]{2,4}-\d{6,8}$/;
  return orderRegex.test(orderNumber);
};

// Export all schemas for use in components
export {
  emailSchema,
  passwordSchema,
  phoneSchema,
  nameSchema,
  blockSchema,
  orderStatusSchema,
  paymentMethodSchema,
  orderItemSchema,
  orderSchema,
  cafeSchema,
  menuItemSchema,
  ratingSchema,
  profileSchema,
};