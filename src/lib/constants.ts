// Enhanced Rewards System Constants
export const LOYALTY_TIERS = {
  FOODIE: 'foodie',
  GOURMET: 'gourmet',
  CONNOISSEUR: 'connoisseur'
} as const;

export const TIER_CONFIG = {
  [LOYALTY_TIERS.FOODIE]: {
    name: 'Foodie',
    minPoints: 0,
    maxPoints: 150,
    discount: 5,
    tierMultiplier: 1.0,
    maintenanceRequired: false,
    maintenanceAmount: 0,
    benefits: [
      '5% discount on all orders',
      'Basic delivery',
      'Standard support'
    ]
  },
  [LOYALTY_TIERS.GOURMET]: {
    name: 'Gourmet',
    minPoints: 151,
    maxPoints: 500,
    discount: 10,
    tierMultiplier: 1.2,
    maintenanceRequired: true,
    maintenanceAmount: 2000,
    benefits: [
      '10% discount on all orders',
      'Free delivery',
      'Priority support',
      'Birthday month: 15% discount',
      'Monthly bonus: 25 extra points'
    ]
  },
  [LOYALTY_TIERS.CONNOISSEUR]: {
    name: 'Connoisseur',
    minPoints: 501,
    maxPoints: Infinity,
    discount: 20,
    tierMultiplier: 1.5,
    maintenanceRequired: true,
    maintenanceAmount: 5000,
    benefits: [
      '20% discount on all orders',
      'Free premium delivery',
      'VIP support',
      'Exclusive menu access',
      'Monthly bonus: 50 extra points',
      'Quarterly rewards: ₹500 voucher'
    ]
  }
} as const;

export const POINTS_CONFIG = {
  BASE_RATE: 10, // 10 points per ₹100 spent
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

export const getTierByPoints = (points: number) => {
  if (points >= TIER_CONFIG[LOYALTY_TIERS.CONNOISSEUR].minPoints) {
    return LOYALTY_TIERS.CONNOISSEUR;
  } else if (points >= TIER_CONFIG[LOYALTY_TIERS.GOURMET].minPoints) {
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
  const basePoints = Math.floor((orderAmount / 100) * POINTS_CONFIG.BASE_RATE);
  const tierMultiplier = getTierInfo(userTier).tierMultiplier;
  
  let newUserMultiplier = 1.0;
  if (isNewUser && newUserOrdersCount <= POINTS_CONFIG.NEW_USER_MAX_ORDERS) {
    if (newUserOrdersCount === 1) {
      newUserMultiplier = POINTS_CONFIG.NEW_USER_FIRST_ORDER_MULTIPLIER;
    } else {
      newUserMultiplier = POINTS_CONFIG.NEW_USER_ORDERS_2_20_MULTIPLIER;
    }
  }
  
  return Math.floor(basePoints * tierMultiplier * newUserMultiplier);
};
