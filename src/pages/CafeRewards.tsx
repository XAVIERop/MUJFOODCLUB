import { useAuth } from '@/hooks/useAuth';
import { useCafeRewards } from '@/hooks/useCafeRewards';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Star, 
  Gift, 
  Crown, 
  Coffee, 
  TrendingUp, 
  RefreshCw,
  Award,
  Target
} from "lucide-react";
import Header from '@/components/Header';
import { CAFE_REWARDS } from '@/lib/constants';

const CafeRewards = () => {
  const { user, profile } = useAuth();
  const { 
    cafeRewards, 
    transactions, 
    loading, 
    error, 
    refreshRewards 
  } = useCafeRewards();

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

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <Trophy className="w-16 h-16 mx-auto mb-2" />
              <p className="text-lg font-semibold">Error Loading Rewards</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <Button onClick={refreshRewards} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case CAFE_REWARDS.TIERS.CONNOISSEUR:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case CAFE_REWARDS.TIERS.GOURMET:
        return <Award className="h-5 w-5 text-blue-500" />;
      default:
        return <Coffee className="h-5 w-5 text-green-500" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case CAFE_REWARDS.TIERS.CONNOISSEUR:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case CAFE_REWARDS.TIERS.GOURMET:
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  const getNextTierProgress = (cafe: any) => {
    if (cafe.tier === CAFE_REWARDS.TIERS.CONNOISSEUR) {
      return { progress: 100, nextTier: null, required: 0 };
    }
    
    const nextTier = cafe.tier === CAFE_REWARDS.TIERS.FOODIE 
      ? CAFE_REWARDS.TIERS.GOURMET 
      : CAFE_REWARDS.TIERS.CONNOISSEUR;
    
    const required = nextTier === CAFE_REWARDS.TIERS.GOURMET 
      ? CAFE_REWARDS.TIER_REQUIREMENTS.GOURMET 
      : CAFE_REWARDS.TIER_REQUIREMENTS.CONNOISSEUR;
    
    const progress = Math.min((cafe.monthly_spend / required) * 100, 100);
    
    return { progress, nextTier, required };
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Cafe Rewards</h1>
            <p className="text-muted-foreground">
              Earn points and unlock benefits at each cafe independently
            </p>
          </div>
          <Button onClick={refreshRewards} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {cafeRewards.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Coffee className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Rewards Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start ordering from cafes to earn points and unlock benefits!
              </p>
              <Button onClick={() => window.location.href = '/cafes'}>
                Browse Cafes
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {cafeRewards.map((cafe) => {
                  const tierProgress = getNextTierProgress(cafe);
                  
                  return (
                    <Card key={cafe.cafe_id} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{cafe.cafe_name}</CardTitle>
                          <Badge className={getTierColor(cafe.tier)}>
                            {getTierIcon(cafe.tier)}
                            <span className="ml-1 capitalize">{cafe.tier}</span>
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {/* Points */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-2" />
                            <span className="text-sm font-medium">Points</span>
                          </div>
                          <span className="text-lg font-bold">{cafe.points}</span>
                        </div>

                        {/* Discount */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Gift className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm font-medium">Discount</span>
                          </div>
                          <span className="text-lg font-bold text-green-600">
                            {cafe.discount_percentage}%
                          </span>
                        </div>

                        {/* Monthly Spend */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <TrendingUp className="h-4 w-4 text-blue-500 mr-2" />
                            <span className="text-sm font-medium">This Month</span>
                          </div>
                          <span className="text-sm font-medium">
                            ₹{cafe.monthly_spend.toFixed(0)}
                          </span>
                        </div>

                        {/* Tier Progress */}
                        {tierProgress.nextTier && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span>Progress to {tierProgress.nextTier}</span>
                              <span>₹{tierProgress.required - cafe.monthly_spend} to go</span>
                            </div>
                            <Progress 
                              value={tierProgress.progress} 
                              className="h-2"
                            />
                          </div>
                        )}

                        {/* Stats */}
                        <div className="pt-2 border-t space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Total Orders</span>
                            <span>{cafe.total_orders}</span>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Total Spent</span>
                            <span>₹{cafe.total_spend.toFixed(0)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-4">
              {transactions.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Transactions</h3>
                    <p className="text-muted-foreground">
                      Your transaction history will appear here after you place orders.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <Card key={transaction.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{transaction.cafe_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₹{transaction.order_amount.toFixed(2)}</p>
                            <p className="text-sm text-green-600">
                              +{transaction.points_earned} points
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default CafeRewards;
