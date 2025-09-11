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

// Create rate limiters for different operations - Optimized for 500+ concurrent users
export const orderRateLimiter = new RateLimiter(10, 60000); // 10 orders per minute per user (increased)
export const apiRateLimiter = new RateLimiter(50, 60000); // 50 API calls per minute per user (increased)
export const menuRateLimiter = new RateLimiter(20, 30000); // 20 menu requests per 30 seconds (increased)
export const adminRateLimiter = new RateLimiter(100, 60000); // 100 admin requests per minute
export const realtimeRateLimiter = new RateLimiter(200, 60000); // 200 realtime updates per minute

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
