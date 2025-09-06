import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Gift, Crown, Zap, Target, Coffee } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCafeLoyalty } from '@/hooks/useCafeLoyalty';
import { useToast } from '@/hooks/use-toast';

const loyaltyTiers = [
  {
    name: "Level 1",
    icon: Star,
    points: "0 - 2,500",
    discount: "5%",
    color: "text-blue-500",
    bgColor: "bg-blue-100",
    benefits: ["5% discount on all orders", "Basic loyalty benefits"],
  },
  {
    name: "Level 2",
    icon: Trophy,
    points: "2,501 - 6,000", 
    discount: "7.5%",
    color: "text-purple-500",
    bgColor: "bg-purple-100",
    benefits: ["7.5% discount on all orders", "Priority customer support"],
  },
  {
    name: "Level 3", 
    icon: Crown,
    points: "6,001+",
    discount: "10%",
    color: "text-yellow-500",
    bgColor: "bg-yellow-100",
    benefits: ["10% discount on all orders", "VIP status", "Exclusive offers", "Monthly maintenance required"],
  }
];

const LoyaltyProgram = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { 
    loyaltyData, 
    loading, 
    getTotalPoints, 
    getTotalSpent, 
    getHighestLoyaltyLevel,
    hasMaintenanceWarnings 
  } = useCafeLoyalty();

  // Get current tier based on highest loyalty level across all cafes
  const getCurrentTier = () => {
    const highestLevel = getHighestLoyaltyLevel();
    const tierIndex = Math.min(highestLevel - 1, loyaltyTiers.length - 1);
    return { ...loyaltyTiers[tierIndex], current: true, progress: 100 };
  };

  const currentTier = getCurrentTier();
  const totalPoints = getTotalPoints();
  const totalSpent = getTotalSpent();

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
                    <div className="text-3xl font-bold">{totalPoints}</div>
                    <div className="text-white/80 text-sm">Total Points</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/90 font-medium">Current Level</span>
                      <span className="text-white/90 text-sm">{currentTier.name} - {currentTier.discount} discount</span>
                    </div>
                    <Progress value={currentTier.progress} className="h-3" />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-xl font-bold">{profile?.total_orders || 0}</div>
                      <div className="text-white/80 text-sm">Orders</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">₹{totalSpent.toLocaleString()}</div>
                      <div className="text-white/80 text-sm">Total Spent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">{loyaltyData.length}</div>
                      <div className="text-white/80 text-sm">Cafes Visited</div>
                    </div>
                  </div>

                <div className="space-y-3">
                  <Button 
                    variant="secondary" 
                    className="w-full"
                    onClick={() => navigate('/rewards')}
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    View Cafe Rewards ({totalPoints} Points)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="mt-6 food-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Coffee className="w-5 h-5 mr-2 text-primary" />
                  Cafe Loyalty Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {loyaltyData.length > 0 ? (
                    loyaltyData.slice(0, 3).map((cafe) => (
                      <div key={cafe.cafe_id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            cafe.loyalty_level === 3 ? 'bg-yellow-100' : 
                            cafe.loyalty_level === 2 ? 'bg-purple-100' : 'bg-blue-100'
                          }`}>
                            {cafe.loyalty_level === 3 ? 
                              <Crown className="w-4 h-4 text-yellow-600" /> : 
                              cafe.loyalty_level === 2 ?
                              <Trophy className="w-4 h-4 text-purple-600" /> :
                              <Star className="w-4 h-4 text-blue-600" />
                            }
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{cafe.cafe_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Level {cafe.loyalty_level} • {cafe.discount_percentage}% discount
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary">
                            {cafe.points}
                          </div>
                          <div className="text-xs text-muted-foreground">points</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No cafe loyalty data yet. Start ordering from cafes to build your loyalty!
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
                        <p className="text-sm text-muted-foreground">{tier.points} points • {tier.discount} discount</p>
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