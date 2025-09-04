// Enhanced Rewards System Constants
export const LOYALTY_TIERS = {
  FOODIE: 'foodie',
  GOURMET: 'gourmet',
  CONNOISSEUR: 'connoisseur'
} as const;

export const TIER_CONFIG = {
  [LOYALTY_TIERS.FOODIE]: {
    name: 'Foodie',
    minSpend: 0,
    maxSpend: 1999,
    discount: 5,
    pointsRate: 5, // 5% points
    tierMultiplier: 1.0,
    maintenanceRequired: false,
    maintenanceAmount: 0,
    benefits: [
      '5% automatic discount on all orders',
      '5% points on all orders',
      'Basic delivery',
      'Standard support'
    ]
  },
  [LOYALTY_TIERS.GOURMET]: {
    name: 'Gourmet',
    minSpend: 2000,
    maxSpend: 4999,
    discount: 10,
    pointsRate: 5, // 5% points
    tierMultiplier: 1.2,
    maintenanceRequired: true,
    maintenanceAmount: 2000,
    benefits: [
      '10% automatic discount on all orders',
      '5% points on all orders',
      'Free delivery',
      'Priority support',
      'Monthly maintenance required: ₹2000'
    ]
  },
  [LOYALTY_TIERS.CONNOISSEUR]: {
    name: 'Connoisseur',
    minSpend: 5000,
    maxSpend: Infinity,
    discount: 20,
    pointsRate: 10, // 10% points
    tierMultiplier: 1.5,
    maintenanceRequired: true,
    maintenanceAmount: 5000,
    benefits: [
      '20% automatic discount on all orders',
      '10% points on all orders',
      'Free premium delivery',
      'VIP support',
      'Exclusive menu access',
      'Monthly maintenance required: ₹5000'
    ]
  }
} as const;

export const POINTS_CONFIG = {
  POINT_VALUE: 1, // 1 point = ₹1
  NEW_USER_FIRST_ORDER_MULTIPLIER: 1.5, // 50% extra points
  NEW_USER_ORDERS_2_20_MULTIPLIER: 1.25, // 25% extra points
  NEW_USER_MAX_ORDERS: 20,
  WELCOME_BONUS_POINTS: 50,
  MAINTENANCE_COMPLETION_BONUS: 200
} as const;

export const MAINTENANCE_CONFIG = {
  GRACE_PERIOD_DAYS: 7,
  WARNING_PERIOD_DAYS: 7,
  TRACKING_WINDOW_DAYS: 30
} as const;

export const POINT_REDEMPTION_OPTIONS = [10, 25, 50] as const;
export const MAX_DISCOUNT_PERCENTAGE = 50; // Maximum 50% discount from points

export const getTierBySpend = (totalSpent: number) => {
  if (totalSpent >= TIER_CONFIG[LOYALTY_TIERS.CONNOISSEUR].minSpend) {
    return LOYALTY_TIERS.CONNOISSEUR;
  } else if (totalSpent >= TIER_CONFIG[LOYALTY_TIERS.GOURMET].minSpend) {
    return LOYALTY_TIERS.GOURMET;
  } else {
    return LOYALTY_TIERS.FOODIE;
  }
};

export const getTierInfo = (tier: string) => {
  return TIER_CONFIG[tier as keyof typeof TIER_CONFIG] || TIER_CONFIG[LOYALTY_TIERS.FOODIE];
};

export const calculatePoints = (
  orderAmount: number,
  userTier: string,
  isNewUser: boolean,
  newUserOrdersCount: number
) => {
  const tierInfo = getTierInfo(userTier);
  const basePoints = Math.floor((orderAmount * tierInfo.pointsRate) / 100);
  
  let newUserMultiplier = 1.0;
  if (isNewUser && newUserOrdersCount <= POINTS_CONFIG.NEW_USER_MAX_ORDERS) {
    if (newUserOrdersCount === 1) {
      newUserMultiplier = POINTS_CONFIG.NEW_USER_FIRST_ORDER_MULTIPLIER;
    } else {
      newUserMultiplier = POINTS_CONFIG.NEW_USER_ORDERS_2_20_MULTIPLIER;
    }
  }
  
  return Math.floor(basePoints * newUserMultiplier);
};

export const calculateLoyaltyDiscount = (orderAmount: number, userTier: string) => {
  const tierInfo = getTierInfo(userTier);
  return Math.floor((orderAmount * tierInfo.discount) / 100);
};
