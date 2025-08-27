import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, QrCode, User, MapPin, Trophy, Star, Package, DollarSign } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import QRCodeDisplay from '@/components/QRCodeDisplay';

const QRCodePage = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <QrCode className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">Please sign in to view your QR code</p>
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
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
              <h1 className="text-3xl font-bold text-foreground flex items-center">
                <QrCode className="w-8 h-8 mr-3 text-primary" />
                Your QR Code & Profile
              </h1>
              <p className="text-muted-foreground mt-2">
                Complete student information and QR code for cafe staff
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code Display */}
          <div>
            <QRCodeDisplay profile={profile} variant="detailed" />
          </div>

          {/* Student Profile Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2 text-primary" />
                  Student Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Block</span>
                    </div>
                    <p className="text-lg font-semibold">{profile.block}</p>
                  </div>
                  
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">Loyalty Tier</span>
                    </div>
                    <p className="text-lg font-semibold capitalize">{profile.loyalty_tier}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Points</span>
                    </div>
                    <p className="text-lg font-semibold text-primary">{profile.loyalty_points}</p>
                  </div>
                  
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Package className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Orders</span>
                    </div>
                    <p className="text-lg font-semibold">{profile.total_orders}</p>
                  </div>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">Total Spent</span>
                  </div>
                  <p className="text-lg font-semibold text-green-600">₹{profile.total_spent.toLocaleString()}</p>
                </div>

                {profile.phone && (
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium">📞 Phone</span>
                    </div>
                    <p className="text-lg font-semibold">{profile.phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* How to Use */}
            <Card>
              <CardHeader>
                <CardTitle>How to Use Your QR Code</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Show at Cafes</p>
                    <p className="text-sm text-muted-foreground">Display your QR code when ordering at any partner cafe</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Staff Scans</p>
                    <p className="text-sm text-muted-foreground">Cafe staff will scan your QR code to link your order</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Earn Rewards</p>
                    <p className="text-sm text-muted-foreground">Automatically earn points and get tier-based discounts</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    4
                  </div>
                  <div>
                    <p className="font-medium">Track Progress</p>
                    <p className="text-sm text-muted-foreground">Monitor your orders, points, and loyalty tier progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>QR Code Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    ✓
                  </div>
                  <span className="text-sm">Automatic tier-based discounts</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    ✓
                  </div>
                  <span className="text-sm">Quick order processing</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    ✓
                  </div>
                  <span className="text-sm">Loyalty points tracking</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    ✓
                  </div>
                  <span className="text-sm">Order history access</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    ✓
                  </div>
                  <span className="text-sm">Student verification</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodePage;
