// Rate limiter for handling concurrent requests
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove requests older than the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }

  getRemainingRequests(key: string): number {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }

  getResetTime(key: string): number {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length === 0) {
      return now;
    }
    
    return validRequests[0] + this.windowMs;
  }
}

// Create rate limiters for different operations
export const orderRateLimiter = new RateLimiter(5, 60000); // 5 orders per minute per user
export const apiRateLimiter = new RateLimiter(20, 60000); // 20 API calls per minute per user
export const menuRateLimiter = new RateLimiter(10, 30000); // 10 menu requests per 30 seconds

// Rate limiting hook
export const useRateLimit = (limiter: RateLimiter, key: string) => {
  const isAllowed = limiter.isAllowed(key);
  const remaining = limiter.getRemainingRequests(key);
  const resetTime = limiter.getResetTime(key);
  
  return {
    isAllowed,
    remaining,
    resetTime,
    resetIn: Math.max(0, resetTime - Date.now()),
  };
};
