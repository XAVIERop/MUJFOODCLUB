import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Gift, Crown, Zap, Target } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { TIER_CONFIG, LOYALTY_TIERS } from '@/lib/constants';

const loyaltyTiers = [
  {
    name: "Foodie",
    icon: Star,
    points: "0 - 150",
    color: "text-gray-500",
    bgColor: "bg-gray-100",
    benefits: TIER_CONFIG[LOYALTY_TIERS.FOODIE].benefits,
  },
  {
    name: "Gourmet",
    icon: Trophy,
    points: "151 - 500", 
    color: "text-orange-500",
    bgColor: "bg-orange-100",
    benefits: TIER_CONFIG[LOYALTY_TIERS.GOURMET].benefits,
  },
  {
    name: "Connoisseur", 
    icon: Crown,
    points: "501+",
    color: "text-purple-500",
    bgColor: "bg-purple-100",
    benefits: TIER_CONFIG[LOYALTY_TIERS.CONNOISSEUR].benefits,
  }
];

const LoyaltyProgram = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLoyaltyData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchLoyaltyData = async () => {
    try {
      const { data, error } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) throw error;
      setRecentTransactions(data || []);
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentTier = () => {
    const points = profile?.loyalty_points || 0;
    if (points < 151) return { ...loyaltyTiers[0], current: true, progress: (points / 151) * 100 };
    if (points < 501) return { ...loyaltyTiers[1], current: true, progress: ((points - 151) / (501 - 151)) * 100 };
    return { ...loyaltyTiers[2], current: true, progress: 100 };
  };

  const getNextTierPoints = () => {
    const points = profile?.loyalty_points || 0;
    if (points < 151) return 151 - points;
    if (points < 501) return 501 - points;
    return 0;
  };

  const currentTier = getCurrentTier();
  const pointsToNext = getNextTierPoints();

  if (!user) {
    return (
      <section id="rewards" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-4 gradient-warm text-white">
              <Trophy className="w-4 h-4 mr-2" />
              Loyalty Program
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Earn Rewards with Every{" "}
              <span className="gradient-primary bg-clip-text text-transparent">
                Bite
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Sign in to start earning rewards and unlock exclusive perks with every order.
            </p>
            <Button variant="hero" onClick={() => navigate('/auth')}>
              Sign In to Start Earning
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="rewards" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 gradient-warm text-white">
            <Trophy className="w-4 h-4 mr-2" />
            Loyalty Program
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Earn Rewards with Every{" "}
            <span className="gradient-primary bg-clip-text text-transparent">
              Bite
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The more you order, the more you save! Unlock exclusive perks and discounts as you level up.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Status Card */}
          <div className="lg:col-span-2">
            <Card className="food-card border-0 gradient-primary text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-white">Your Progress</CardTitle>
                    <p className="text-white/80">Keep ordering to unlock rewards!</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{profile?.loyalty_points || 0}</div>
                    <div className="text-white/80 text-sm">Total Points</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/90 font-medium">Progress to Next Tier</span>
                      <span className="text-white/90 text-sm">{pointsToNext} points to go</span>
                    </div>
                    <Progress value={currentTier.progress} className="h-3" />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-xl font-bold">{profile?.total_orders || 0}</div>
                      <div className="text-white/80 text-sm">Orders</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">₹{Math.round((profile?.total_spent || 0) * 0.1)}</div>
                      <div className="text-white/80 text-sm">Saved</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">3</div>
                      <div className="text-white/80 text-sm">Cafes Visited</div>
                    </div>
                  </div>

                <div className="space-y-3">
                  <Button 
                    variant="secondary" 
                    className="w-full"
                    onClick={() => navigate('/cafes')}
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Redeem Points ({profile?.loyalty_points || 0} Available)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="mt-6 food-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTransactions.length > 0 ? (
                    recentTransactions.map((transaction: any) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            transaction.transaction_type === 'bonus' ? 'gradient-warm' : 'gradient-success'
                          }`}>
                            {transaction.transaction_type === 'bonus' ? 
                              <Gift className="w-4 h-4 text-white" /> : 
                              <Target className="w-4 h-4 text-white" />
                            }
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${transaction.points_change > 0 ? 'text-primary' : 'text-red-500'}`}>
                            {transaction.points_change > 0 ? '+' : ''}{transaction.points_change}
                          </div>
                          <div className="text-xs text-muted-foreground">points</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No recent activity. Start ordering to earn points!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Loyalty Tiers */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-foreground mb-4">Loyalty Tiers</h3>
            {loyaltyTiers.map((tier, index) => {
              const Icon = tier.icon;
              const isCurrentTier = currentTier.name === tier.name;
              return (
                <Card 
                  key={tier.name} 
                  className={`food-card border-0 ${isCurrentTier ? 'ring-2 ring-primary shadow-glow' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-10 h-10 rounded-full ${tier.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${tier.color}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-foreground flex items-center">
                          {tier.name}
                          {isCurrentTier && <Badge className="ml-2 text-xs gradient-primary text-white">Current</Badge>}
                        </h4>
                        <p className="text-sm text-muted-foreground">{tier.points} points</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {tier.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                          {benefit}
                        </div>
                      ))}
                    </div>

                    {isCurrentTier && currentTier.progress > 0 && currentTier.progress < 100 && (
                      <div className="mt-4">
                        <Progress value={currentTier.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {Math.round(currentTier.progress)}% to next tier
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoyaltyProgram;