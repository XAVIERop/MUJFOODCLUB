import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Gift, 
  Crown, 
  Star, 
  ArrowLeft, 
  TrendingUp, 
  ShoppingCart, 
  Clock,
  CheckCircle,
  Zap
} from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LoyaltyTransaction {
  id: string;
  user_id: string;
  points: number;
  type: 'earned' | 'redeemed';
  description: string;
  created_at: string;
}

const Rewards = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierInfo = (points: number) => {
    if (points >= 1000) {
      return {
        name: 'Diamond',
        color: 'text-blue-500',
        bgColor: 'bg-blue-500',
        icon: Crown,
        nextTier: null,
        pointsToNext: 0
      };
    } else if (points >= 500) {
      return {
        name: 'Gold',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500',
        icon: Star,
        nextTier: 'Diamond',
        pointsToNext: 1000 - points
      };
    } else if (points >= 200) {
      return {
        name: 'Silver',
        color: 'text-gray-500',
        bgColor: 'bg-gray-500',
        icon: Star,
        nextTier: 'Gold',
        pointsToNext: 500 - points
      };
    } else {
      return {
        name: 'Bronze',
        color: 'text-orange-500',
        bgColor: 'bg-orange-500',
        icon: Star,
        nextTier: 'Silver',
        pointsToNext: 200 - points
      };
    }
  };

  const tierInfo = getTierInfo(profile?.loyalty_points || 0);
  const Icon = tierInfo.icon;

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Login Required</h3>
            <p className="text-muted-foreground mb-6">Please log in to view your rewards</p>
            <Button onClick={() => navigate('/auth')}>
              <Gift className="w-4 h-4 mr-2" />
              Login to View Rewards
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading rewards...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                My Rewards
              </h1>
              <p className="text-lg text-muted-foreground">
                Track your loyalty points and exclusive benefits
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Rewards Card */}
          <div className="lg:col-span-2">
            <Card className="food-card border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-foreground">Loyalty Program</h2>
                  <Badge className={`${tierInfo.bgColor} text-white`}>
                    <Icon className="w-4 h-4 mr-2" />
                    {tierInfo.name} Tier
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Points Display */}
                <div className="text-center py-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
                  <div className="text-4xl font-bold text-foreground mb-2">
                    {profile?.loyalty_points || 0}
                  </div>
                  <div className="text-muted-foreground">Total Points</div>
                </div>

                {/* Progress to Next Tier */}
                {tierInfo.nextTier && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-foreground font-medium">Progress to {tierInfo.nextTier} Tier</span>
                      <span className="text-muted-foreground text-sm">{tierInfo.pointsToNext} points to go</span>
                    </div>
                    <Progress 
                      value={((profile?.loyalty_points || 0) / (tierInfo.nextTier === 'Diamond' ? 1000 : tierInfo.nextTier === 'Gold' ? 500 : 200)) * 100} 
                      className="h-3" 
                    />
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-foreground">{profile?.total_orders || 0}</div>
                    <div className="text-muted-foreground text-sm">Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-foreground">₹{Math.round((profile?.total_spent || 0) * 0.1)}</div>
                    <div className="text-muted-foreground text-sm">Saved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-foreground">3</div>
                    <div className="text-muted-foreground text-sm">Cafes Visited</div>
                  </div>
                </div>

                {/* Redeem Button */}
                <Button variant="loyalty" className="w-full">
                  <Gift className="w-4 h-4 mr-2" />
                  Redeem Points ({profile?.loyalty_points || 0} Available)
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="mt-6 food-card border-0">
              <CardHeader>
                <h3 className="text-xl font-bold text-foreground">Recent Activity</h3>
              </CardHeader>
              <CardContent>
                {transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            transaction.type === 'earned' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {transaction.type === 'earned' ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <Gift className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className={`font-bold ${
                          transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'earned' ? '+' : '-'}{transaction.points} pts
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Benefits Sidebar */}
          <div className="space-y-6">
            {/* Tier Benefits */}
            <Card className="food-card border-0">
              <CardHeader>
                <h3 className="text-xl font-bold text-foreground">Tier Benefits</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm">Free delivery on orders above ₹200</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm">Priority customer support</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm">Exclusive menu items</span>
                  </div>
                  {tierInfo.name === 'Gold' && (
                    <div className="flex items-center space-x-3">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      <span className="text-sm">Double points on weekends</span>
                    </div>
                  )}
                  {tierInfo.name === 'Diamond' && (
                    <>
                      <div className="flex items-center space-x-3">
                        <Zap className="w-5 h-5 text-blue-500" />
                        <span className="text-sm">Triple points on weekends</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Crown className="w-5 h-5 text-blue-500" />
                        <span className="text-sm">VIP table reservations</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="food-card border-0">
              <CardHeader>
                <h3 className="text-xl font-bold text-foreground">Quick Actions</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full" onClick={() => navigate('/cafes')}>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Order Food
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate('/orders')}>
                  <Clock className="w-4 h-4 mr-2" />
                  Track Orders
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rewards;
