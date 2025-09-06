import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCafeLoyalty } from '@/hooks/useCafeLoyalty';
import { CafeLoyaltyCard } from '@/components/CafeLoyaltyCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Trophy, 
  Star, 
  TrendingUp, 
  Gift, 
  AlertTriangle, 
  Clock,
  RefreshCw,
  Coffee,
  ShoppingBag,
  Crown
} from 'lucide-react';
import Header from '@/components/Header';
import QRCodeDisplay from '@/components/QRCodeDisplay';

const CafeRewards = () => {
  const { user, profile } = useAuth();
  const {
    loyaltyData,
    transactions,
    loading,
    error,
    fetchLoyaltySummary,
    fetchCafeTransactions,
    getTotalPoints,
    getTotalSpent,
    getHighestLoyaltyLevel,
    hasMaintenanceWarnings,
    getMaintenanceWarnings,
    refreshLoyaltyData
  } = useCafeLoyalty();

  // Debug logging
  console.log('CafeRewards Debug:', {
    user: user ? 'authenticated' : 'not authenticated',
    profile: profile ? 'loaded' : 'not loaded',
    loading,
    error,
    loyaltyDataLength: loyaltyData.length
  });

  const [selectedCafe, setSelectedCafe] = useState<string | null>(null);

  // Get maintenance warnings
  const maintenanceWarnings = getMaintenanceWarnings();

  // Get total stats
  const totalPoints = getTotalPoints();
  const totalSpent = getTotalSpent();
  const highestLevel = getHighestLoyaltyLevel();

  // Get cafe with highest loyalty
  const topCafe = loyaltyData.reduce((top, current) => 
    current.total_spent > top.total_spent ? current : top, 
    loyaltyData[0] || null
  );

  // Show authentication required message if not signed in
  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
              <p className="text-muted-foreground">Please sign in to view your loyalty rewards</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your loyalty rewards...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Error Loading Rewards</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={refreshLoyaltyData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="h-8 w-8 text-yellow-500 mr-2" />
            <h1 className="text-3xl font-bold">Cafe Loyalty Rewards</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Earn points and unlock exclusive benefits at each cafe. Your loyalty is rewarded with discounts, 
            priority service, and special perks!
          </p>
        </div>

        {/* Maintenance Warnings */}
        {hasMaintenanceWarnings() && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-2">Monthly Maintenance Required!</div>
              <div className="space-y-1">
                {maintenanceWarnings.map((warning) => (
                  <div key={warning.cafe_id} className="text-sm">
                    <strong>{warning.cafe_name}</strong>: Spend ₹{Math.max(0, warning.monthly_maintenance_required - warning.monthly_maintenance_spent).toLocaleString()} more in {warning.days_until_month_end} days to maintain Level 3 status.
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-5 w-5 text-yellow-500 mr-1" />
                <span className="text-sm font-medium">Total Points</span>
              </div>
              <div className="text-2xl font-bold text-primary">{totalPoints}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-5 w-5 text-blue-500 mr-1" />
                <span className="text-sm font-medium">Total Spent</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">₹{totalSpent.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="h-5 w-5 text-purple-500 mr-1" />
                <span className="text-sm font-medium">Highest Level</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">Level {highestLevel}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Coffee className="h-5 w-5 text-green-500 mr-1" />
                <span className="text-sm font-medium">Active Cafes</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{loyaltyData.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Top Cafe Highlight */}
        {topCafe && (
          <Card className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Crown className="h-5 w-5 text-yellow-600 mr-2" />
                  Your Top Cafe
                </CardTitle>
                <Badge className="bg-yellow-100 text-yellow-800">
                  Level {topCafe.loyalty_level}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{topCafe.cafe_name}</h3>
                  <p className="text-muted-foreground">
                    ₹{topCafe.total_spent.toLocaleString()} spent • {topCafe.points} points • {topCafe.discount_percentage}% discount
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-600">{topCafe.discount_percentage}%</div>
                  <div className="text-sm text-muted-foreground">discount</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="loyalty" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="loyalty">Cafe Loyalty</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Cafe Loyalty Tab */}
          <TabsContent value="loyalty" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Your Cafe Loyalty Status</h2>
              <Button onClick={refreshLoyaltyData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {loyaltyData.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Loyalty Data Yet</h3>
                  <p className="text-muted-foreground">
                    Start ordering from our cafes to begin earning loyalty points and rewards!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loyaltyData.map((cafe) => (
                  <CafeLoyaltyCard key={cafe.cafe_id} loyaltyData={cafe} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <h2 className="text-2xl font-semibold">Recent Transactions</h2>
            
            {selectedCafe ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    Transactions for {loyaltyData.find(c => c.cafe_id === selectedCafe)?.cafe_name}
                  </h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedCafe(null)}
                  >
                    View All
                  </Button>
                </div>
                
                {transactions.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground">No transactions found for this cafe.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {transactions.map((transaction) => (
                      <Card key={transaction.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(transaction.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant={transaction.points_change > 0 ? "default" : "secondary"}>
                              {transaction.points_change > 0 ? "+" : ""}{transaction.points_change} pts
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loyaltyData.map((cafe) => (
                  <Card 
                    key={cafe.cafe_id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      setSelectedCafe(cafe.cafe_id);
                      fetchCafeTransactions(cafe.cafe_id);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{cafe.cafe_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {cafe.points} points • Level {cafe.loyalty_level}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          View Transactions
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <h2 className="text-2xl font-semibold">Your Profile</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>QR Code</CardTitle>
                </CardHeader>
                <CardContent>
                  <QRCodeDisplay />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-lg">{profile?.full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Student ID</label>
                    <p className="text-lg">{profile?.student_id || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Block</label>
                    <p className="text-lg">{profile?.block || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Total Orders</label>
                    <p className="text-lg">{profile?.total_orders || 0}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CafeRewards;
