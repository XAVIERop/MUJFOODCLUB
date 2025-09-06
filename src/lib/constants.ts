// Cafe-Specific Rewards System Constants
export const CAFE_REWARDS = {
  // Tier Structure
  TIERS: {
    FOODIE: 'foodie',
    GOURMET: 'gourmet', 
    CONNOISSEUR: 'connoisseur'
  },
  
  // Tier Requirements (Monthly Spend)
  TIER_REQUIREMENTS: {
    FOODIE: 0,
    GOURMET: 2500,
    CONNOISSEUR: 5000
  },
  
  // Tier Benefits (Discount Percentage)
  TIER_DISCOUNTS: {
    FOODIE: 5,
    GOURMET: 7.5,
    CONNOISSEUR: 10
  },
  
  // Points System
  FIRST_ORDER_BONUS: 50, // Points for first order ≥ ₹249
  FIRST_ORDER_MIN_AMOUNT: 249, // Minimum amount for first order bonus
  POINTS_RATE: 0.05, // 5% of order amount as points
  
  // Redemption Rules
  POINT_VALUE: 1, // 1 point = ₹1
  MAX_REDEMPTION_PERCENTAGE: 10, // Max 10% of order value
} as const;

// Helper Functions
export const getTierByMonthlySpend = (monthlySpend: number) => {
  if (monthlySpend >= CAFE_REWARDS.TIER_REQUIREMENTS.CONNOISSEUR) {
    return CAFE_REWARDS.TIERS.CONNOISSEUR;
  } else if (monthlySpend >= CAFE_REWARDS.TIER_REQUIREMENTS.GOURMET) {
    return CAFE_REWARDS.TIERS.GOURMET;
  } else {
    return CAFE_REWARDS.TIERS.FOODIE;
  }
};

export const getTierDiscount = (tier: string) => {
  return CAFE_REWARDS.TIER_DISCOUNTS[tier as keyof typeof CAFE_REWARDS.TIER_DISCOUNTS] || CAFE_REWARDS.TIER_DISCOUNTS.FOODIE;
};

export const calculatePointsEarned = (orderAmount: number, isFirstOrder: boolean) => {
  let points = Math.floor(orderAmount * CAFE_REWARDS.POINTS_RATE);
  
  // Add first order bonus if applicable
  if (isFirstOrder && orderAmount >= CAFE_REWARDS.FIRST_ORDER_MIN_AMOUNT) {
    points += CAFE_REWARDS.FIRST_ORDER_BONUS;
  }
  
  return points;
};

export const calculateMaxRedeemablePoints = (orderAmount: number) => {
  return Math.floor(orderAmount * CAFE_REWARDS.MAX_REDEMPTION_PERCENTAGE / 100);
};
