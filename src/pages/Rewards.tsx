import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, TrendingUp, Gift, Crown, Gem, Diamond, Clock, AlertTriangle, CheckCircle, Zap } from "lucide-react";
import QRCodeDisplay from '@/components/QRCodeDisplay';
import { useEffect, useState } from 'react';
import { TIER_CONFIG, LOYALTY_TIERS, POINTS_CONFIG, MAINTENANCE_CONFIG } from '@/lib/constants';
import Header from '@/components/Header';

interface RewardsSummary {
  current_tier: string;
  current_points: number;
  tier_discount: number;
  next_tier: string | null;
  points_to_next_tier: number;
  maintenance_required: boolean;
  maintenance_amount: number;
  maintenance_spent: number;
  maintenance_progress: number;
  days_until_expiry: number;
  is_new_user: boolean;
  new_user_orders_count: number;
}

const Rewards = () => {
  const { user, profile } = useAuth();
  const [rewardsSummary, setRewardsSummary] = useState<RewardsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && profile) {
      calculateRewardsSummary();
    }
  }, [user, profile]);

  const calculateRewardsSummary = () => {
    try {
      console.log('Enhanced Rewards System Loading...'); // Debug log
      // Calculate rewards data locally instead of calling database function
      const currentTier = profile.loyalty_tier || 'foodie';
      const currentPoints = profile.loyalty_points || 0;
      
      // Determine next tier and points needed
      let nextTier: string | null = null;
      let pointsToNextTier = 0;
      
      if (currentTier === 'foodie' && currentPoints < 151) {
        nextTier = 'gourmet';
        pointsToNextTier = 151 - currentPoints;
      } else if (currentTier === 'gourmet' && currentPoints < 501) {
        nextTier = 'connoisseur';
        pointsToNextTier = 501 - currentPoints;
      }
      
      // Calculate maintenance info
      const maintenanceRequired = currentTier === 'gourmet' || currentTier === 'connoisseur';
      const maintenanceAmount = currentTier === 'gourmet' ? 2000 : currentTier === 'connoisseur' ? 5000 : 0;
      
      // For now, use placeholder values for maintenance tracking
      const maintenanceSpent = 0;
      const maintenanceProgress = 0;
      const daysUntilExpiry = 30; // Placeholder
      
      // Assume new user status based on points
      const isNewUser = currentPoints < 100;
      const newUserOrdersCount = Math.floor(currentPoints / 10); // Rough estimate
      
      const summary: RewardsSummary = {
        current_tier: currentTier,
        current_points: currentPoints,
        tier_discount: TIER_CONFIG[currentTier as keyof typeof TIER_CONFIG]?.discount || 5,
        next_tier: nextTier,
        points_to_next_tier: pointsToNextTier,
        maintenance_required: maintenanceRequired,
        maintenance_amount: maintenanceAmount,
        maintenance_spent: maintenanceSpent,
        maintenance_progress: maintenanceProgress,
        days_until_expiry: daysUntilExpiry,
        is_new_user: isNewUser,
        new_user_orders_count: newUserOrdersCount
      };
      
      setRewardsSummary(summary);
    } catch (error) {
      console.error('Error calculating rewards summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
            <p className="text-muted-foreground">Please sign in to view your rewards</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your rewards...</p>
          </div>
        </div>
      </div>
    );
  }

  const currentTierInfo = TIER_CONFIG[profile.loyalty_tier as keyof typeof TIER_CONFIG] || TIER_CONFIG[LOYALTY_TIERS.FOODIE];
  const nextTierInfo = rewardsSummary?.next_tier ? TIER_CONFIG[rewardsSummary.next_tier as keyof typeof TIER_CONFIG] : null;

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'connoisseur':
        return <Crown className="w-6 h-6" />;
      case 'gourmet':
        return <Gem className="w-6 h-6" />;
      default:
        return <Star className="w-6 h-6" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'connoisseur':
        return 'bg-purple-500 text-white';
      case 'gourmet':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-green-500 text-white';
    }
  };

  const getTierBgColor = (tier: string) => {
    switch (tier) {
      case 'connoisseur':
        return 'bg-purple-50 border-purple-200';
      case 'gourmet':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-green-50 border-green-200';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <Trophy className="w-8 h-8 mr-3 text-primary" />
            Your Enhanced Rewards & Loyalty
          </h1>
          <p className="text-muted-foreground mt-2">
            Unlock exclusive benefits and earn more points with every order
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Current Tier Card */}
          <Card className="border-2 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                {getTierIcon(profile.loyalty_tier)}
                <span>Current Tier</span>
                <Badge className={getTierColor(profile.loyalty_tier)}>
                  {currentTierInfo.name}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {currentTierInfo.discount}% OFF
                </div>
                <p className="text-sm text-muted-foreground">
                  on all orders
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Current Points:</span>
                  <span className="font-semibold">{profile.loyalty_points}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Tier Multiplier:</span>
                  <span className="font-semibold">{currentTierInfo.tierMultiplier}x</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Points & Progress Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Progress to Next Tier
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {nextTierInfo ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Next Tier:</span>
                      <Badge variant="outline">{nextTierInfo.name}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Points Needed:</span>
                      <span className="font-semibold">{rewardsSummary?.points_to_next_tier || 0}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress:</span>
                      <span className="text-sm font-medium">
                        {Math.round(((profile.loyalty_points - currentTierInfo.minPoints) / (nextTierInfo.minPoints - currentTierInfo.minPoints)) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={((profile.loyalty_points - currentTierInfo.minPoints) / (nextTierInfo.minPoints - currentTierInfo.minPoints)) * 100} 
                      className="h-2"
                    />
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    You've reached the highest tier!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Maintenance Status Card */}
          {rewardsSummary?.maintenance_required && (
            <Card className={getTierBgColor(profile.loyalty_tier)}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Maintenance Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Required:</span>
                    <span className="font-semibold">₹{rewardsSummary.maintenance_amount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Spent:</span>
                    <span className="font-semibold">₹{rewardsSummary.maintenance_spent}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Days Left:</span>
                    <span className={`font-semibold ${rewardsSummary.days_until_expiry <= 7 ? 'text-red-600' : 'text-green-600'}`}>
                      {rewardsSummary.days_until_expiry}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress:</span>
                    <span className="text-sm font-medium">
                      {Math.round(rewardsSummary.maintenance_progress)}%
                    </span>
                  </div>
                  <Progress 
                    value={rewardsSummary.maintenance_progress} 
                    className="h-2"
                  />
                </div>

                {rewardsSummary.days_until_expiry <= 7 && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-700 font-medium">
                      Maintenance expires in {rewardsSummary.days_until_expiry} days!
                    </span>
                  </div>
                )}

                {rewardsSummary.maintenance_progress >= 100 && (
                  <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">
                      Maintenance completed! +200 bonus points
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* New User Benefits Card */}
          {rewardsSummary?.is_new_user && rewardsSummary.new_user_orders_count <= POINTS_CONFIG.NEW_USER_MAX_ORDERS && (
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  New User Benefits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-700 mb-2">
                    {rewardsSummary.new_user_orders_count === 1 ? '50%' : '25%'} Extra Points
                  </div>
                  <p className="text-sm text-yellow-600">
                    {rewardsSummary.new_user_orders_count === 1 
                      ? 'First order bonus!' 
                      : `Orders ${rewardsSummary.new_user_orders_count}-${POINTS_CONFIG.NEW_USER_MAX_ORDERS}`
                    }
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Orders Used:</span>
                    <span className="font-semibold">
                      {rewardsSummary.new_user_orders_count}/{POINTS_CONFIG.NEW_USER_MAX_ORDERS}
                    </span>
                  </div>
                  <Progress 
                    value={(rewardsSummary.new_user_orders_count / POINTS_CONFIG.NEW_USER_MAX_ORDERS) * 100} 
                    className="h-2 bg-yellow-100"
                  />
                </div>

                {rewardsSummary.new_user_orders_count === 1 && (
                  <div className="flex items-center gap-2 p-2 bg-yellow-100 border border-yellow-300 rounded-lg">
                    <Gift className="w-4 h-4 text-yellow-700" />
                    <span className="text-sm text-yellow-800 font-medium">
                      Welcome bonus: +50 points
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tier Benefits Card */}
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                Your Tier Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {currentTierInfo.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* QR Code Card */}
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-5 h-5 bg-black rounded-sm" />
                Your Loyalty QR Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <QRCodeDisplay profile={profile} />
                <p className="text-sm text-muted-foreground text-center">
                  Show this QR code to cafe staff to earn points on offline orders
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Rewards;
