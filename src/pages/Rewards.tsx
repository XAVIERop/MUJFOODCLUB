import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, TrendingUp, Gift, Crown, Gem, Diamond } from "lucide-react";
import QRCodeDisplay from '@/components/QRCodeDisplay';

const Rewards = () => {
  const { user, profile } = useAuth();

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-background">
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

  const getTierInfo = (tier: string) => {
    switch (tier) {
      case 'connoisseur':
        return {
          name: 'Connoisseur',
          icon: <Crown className="w-5 h-5" />,
          color: 'bg-purple-500 text-white',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          minSpent: 10000,
          discount: '15%',
          benefits: ['15% discount on all orders', 'Priority customer support', 'Exclusive menu items', 'Birthday rewards']
        };
      case 'gourmet':
        return {
          name: 'Gourmet',
          icon: <Gem className="w-5 h-5" />,
          color: 'bg-blue-500 text-white',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          minSpent: 5000,
          discount: '10%',
          benefits: ['10% discount on all orders', 'Free delivery', 'Special offers', 'Loyalty bonus']
        };
      case 'foodie':
        return {
          name: 'Foodie',
          icon: <Star className="w-5 h-5" />,
          color: 'bg-green-500 text-white',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          minSpent: 1000,
          discount: '5%',
          benefits: ['5% discount on all orders', 'Points multiplier', 'Welcome bonus', 'Regular updates']
        };
      default:
        return {
          name: 'New Member',
          icon: <Star className="w-5 h-5" />,
          color: 'bg-gray-500 text-white',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          minSpent: 0,
          discount: '0%',
          benefits: ['Start earning points', 'Basic rewards', 'Welcome package', 'Member benefits']
        };
    }
  };

  const getNextTierInfo = (currentTier: string) => {
    switch (currentTier) {
      case 'foodie':
        return getTierInfo('gourmet');
      case 'gourmet':
        return getTierInfo('connoisseur');
      case 'connoisseur':
        return null; // Already at max tier
      default:
        return getTierInfo('foodie');
    }
  };

  const currentTierInfo = getTierInfo(profile.loyalty_tier);
  const nextTierInfo = getNextTierInfo(profile.loyalty_tier);
  const progressToNext = nextTierInfo 
    ? Math.min(100, (profile.total_spent / nextTierInfo.minSpent) * 100)
    : 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <Trophy className="w-8 h-8 mr-3 text-primary" />
            Your Rewards & Loyalty
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your progress, earn points, and unlock exclusive benefits
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Loyalty Info */}
          <div className="space-y-6">
            {/* Current Tier */}
            <Card className={`${currentTierInfo.bgColor} ${currentTierInfo.borderColor} border-2`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    {currentTierInfo.icon}
                    <span className="ml-2">Current Tier</span>
                  </span>
                  <Badge className={currentTierInfo.color}>
                    {currentTierInfo.name}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-background rounded-lg">
                    <p className="text-2xl font-bold text-primary">{profile.loyalty_points}</p>
                    <p className="text-sm text-muted-foreground">Points</p>
                  </div>
                  <div className="text-center p-3 bg-background rounded-lg">
                    <p className="text-2xl font-bold text-green-600">₹{profile.total_spent.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="font-semibold">Current Benefits:</p>
                  <ul className="space-y-1">
                    {currentTierInfo.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Progress to Next Tier */}
            {nextTierInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                    Progress to Next Tier
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{currentTierInfo.name}</span>
                    <span className="text-sm font-medium">{nextTierInfo.name}</span>
                  </div>
                  <Progress value={progressToNext} className="w-full" />
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      ₹{profile.total_spent.toLocaleString()} / ₹{nextTierInfo.minSpent.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(progressToNext)}% complete
                    </p>
                  </div>
                  
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="font-semibold text-sm mb-2">Next Tier Benefits:</p>
                    <ul className="space-y-1">
                      {nextTierInfo.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gift className="w-5 h-5 mr-2 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Order #{profile.total_orders}</p>
                      <p className="text-sm text-muted-foreground">Latest order completed</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">+{Math.floor(profile.total_spent / profile.total_orders)} pts</p>
                      <p className="text-xs text-muted-foreground">Points earned</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Tier Upgrade</p>
                      <p className="text-sm text-muted-foreground">Reached {currentTierInfo.name} tier</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">{currentTierInfo.discount}</p>
                      <p className="text-xs text-muted-foreground">Discount unlocked</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - QR Code */}
          <div className="space-y-6">
            {/* QR Code Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center mr-2">
                    QR
                  </div>
                  Your QR Code
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Show this QR code at any cafe to earn points and get tier-based discounts
                </p>
              </CardHeader>
              <CardContent>
                <QRCodeDisplay profile={profile} variant="simple" />
              </CardContent>
            </Card>

            {/* How Points Work */}
            <Card>
              <CardHeader>
                <CardTitle>How Points Work</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3">
                        ₹
                      </div>
                      <div>
                        <p className="font-medium">Earn Points</p>
                        <p className="text-sm text-muted-foreground">1 point per ₹1 spent</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Automatic</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3">
                        %
                      </div>
                      <div>
                        <p className="font-medium">Tier Discounts</p>
                        <p className="text-sm text-muted-foreground">{currentTierInfo.discount} off all orders</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{currentTierInfo.name}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-3">
                        ⭐
                      </div>
                      <div>
                        <p className="font-medium">Redeem Points</p>
                        <p className="text-sm text-muted-foreground">Use points for discounts</p>
                      </div>
                    </div>
                    <Badge variant="secondary">At Checkout</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg text-center cursor-pointer hover:bg-primary/20 transition-colors">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-2">
                      📱
                    </div>
                    <p className="text-sm font-medium">View Orders</p>
                  </div>
                  
                  <div className="p-3 bg-secondary/10 rounded-lg text-center cursor-pointer hover:bg-secondary/20 transition-colors">
                    <div className="w-8 h-8 bg-secondary text-white rounded-full flex items-center justify-center mx-auto mb-2">
                      🏪
                    </div>
                    <p className="text-sm font-medium">Explore Cafes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rewards;
