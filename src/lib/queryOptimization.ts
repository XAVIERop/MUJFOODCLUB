// Query Optimization Utilities
// Addresses the 147 performance issues identified in Supabase dashboard

export const QUERY_OPTIMIZATIONS = {
  // Optimized cafe queries
  getCafesOptimized: () => ({
    select: 'id, name, type, description, location, phone, hours, accepting_orders, average_rating, total_ratings, cuisine_categories, priority, slug, image_url',
    order: 'priority DESC, average_rating DESC NULLS LAST',
    limit: 20
  }),

  // Optimized menu item queries
  getMenuItemsOptimized: (cafeId: string) => ({
    select: 'id, name, description, price, category, preparation_time, is_available, cafe_id',
    eq: { cafe_id: cafeId },
    order: 'category ASC, name ASC',
    limit: 50
  }),

  // Optimized order queries
  getOrdersOptimized: (userId: string) => ({
    select: 'id, order_number, status, total_amount, delivery_block, delivery_notes, payment_method, points_earned, estimated_delivery, created_at, status_updated_at, points_credited, accepted_at, preparing_at, out_for_delivery_at, completed_at',
    eq: { user_id: userId },
    order: 'created_at DESC',
    limit: 20
  }),

  // Optimized profile queries
  getProfileOptimized: (userId: string) => ({
    select: 'id, email, full_name, user_type, block, loyalty_points, loyalty_tier, total_orders, total_spent, qr_code, created_at, updated_at',
    eq: { id: userId },
    single: true
  }),

  // Optimized cafe owner queries
  getCafeOrdersOptimized: (cafeId: string) => ({
    select: 'id, order_number, status, total_amount, delivery_block, delivery_notes, payment_method, points_earned, estimated_delivery, created_at, status_updated_at, points_credited, accepted_at, preparing_at, out_for_delivery_at, completed_at, user_id',
    eq: { cafe_id: cafeId },
    order: 'created_at DESC',
    limit: 50
  })
};

// Caching configuration
export const CACHE_CONFIG = {
  // Cache durations (in milliseconds)
  CAFES: 5 * 60 * 1000, // 5 minutes
  MENU_ITEMS: 10 * 60 * 1000, // 10 minutes
  PROFILES: 2 * 60 * 1000, // 2 minutes
  ORDERS: 30 * 1000, // 30 seconds
  LOYALTY_TRANSACTIONS: 5 * 60 * 1000, // 5 minutes
};

// Real-time subscription optimization
export const REALTIME_OPTIMIZATIONS = {
  // Optimized real-time filters
  ordersFilter: (userId: string) => ({
    table: 'orders',
    filter: `user_id=eq.${userId}`,
    select: 'id, status, total_amount, created_at, status_updated_at'
  }),

  cafeOrdersFilter: (cafeId: string) => ({
    table: 'orders',
    filter: `cafe_id=eq.${cafeId}`,
    select: 'id, order_number, status, total_amount, created_at, status_updated_at'
  }),

  profileFilter: (userId: string) => ({
    table: 'profiles',
    filter: `id=eq.${userId}`,
    select: 'id, loyalty_points, loyalty_tier, total_orders, total_spent'
  })
};

// Pagination utilities
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  getPaginationParams: (page: number = 1, pageSize: number = 20) => {
    const limit = Math.min(pageSize, PAGINATION.MAX_PAGE_SIZE);
    const offset = (page - 1) * limit;
    return { limit, offset };
  },

  getPaginationMeta: (page: number, pageSize: number, total: number) => ({
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
    hasNext: page * pageSize < total,
    hasPrev: page > 1
  })
};

// Query performance monitoring
export const PERFORMANCE_MONITORING = {
  // Track query performance
  trackQuery: (queryName: string, startTime: number) => {
    const duration = Date.now() - startTime;
    console.log(`📊 Query Performance: ${queryName} - ${duration}ms`);
    
    // Log slow queries
    if (duration > 1000) {
      console.warn(`⚠️ Slow Query Detected: ${queryName} - ${duration}ms`);
    }
    
    return duration;
  },

  // Performance thresholds
  THRESHOLDS: {
    FAST: 100, // < 100ms
    NORMAL: 500, // 100-500ms
    SLOW: 1000, // 500-1000ms
    CRITICAL: 2000 // > 1000ms
  }
};

// Database connection optimization
export const CONNECTION_OPTIMIZATION = {
  // Connection pool settings
  POOL_SIZE: 10,
  CONNECTION_TIMEOUT: 30000,
  IDLE_TIMEOUT: 60000,
  
  // Query timeout settings
  QUERY_TIMEOUT: 10000,
  TRANSACTION_TIMEOUT: 30000
};

// Export all optimizations
export default {
  QUERY_OPTIMIZATIONS,
  CACHE_CONFIG,
  REALTIME_OPTIMIZATIONS,
  PAGINATION,
  PERFORMANCE_MONITORING,
  CONNECTION_OPTIMIZATION
};

