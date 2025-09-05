import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Star, 
  Gift, 
  Percent, 
  AlertTriangle, 
  CheckCircle,
  Coffee,
  Crown
} from 'lucide-react';
import { useCafeLoyalty } from '@/hooks/useCafeLoyalty';
import { useToast } from '@/hooks/use-toast';

interface CafeCheckoutLoyaltyProps {
  cafeId: string;
  cafeName: string;
  totalAmount: number;
  onLoyaltyDiscountChange: (discount: number) => void;
  onPointsRedeemChange: (points: number, discount: number) => void;
}

export const CafeCheckoutLoyalty: React.FC<CafeCheckoutLoyaltyProps> = ({
  cafeId,
  cafeName,
  totalAmount,
  onLoyaltyDiscountChange,
  onPointsRedeemChange
}) => {
  const { toast } = useToast();
  const { getCafeLoyalty, calculateDiscount, canRedeemPoints } = useCafeLoyalty();
  
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [customPointsInput, setCustomPointsInput] = useState('');
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);
  const [pointsDiscount, setPointsDiscount] = useState(0);

  // Get cafe loyalty data
  const cafeLoyalty = getCafeLoyalty(cafeId);

  // Calculate loyalty discount
  useEffect(() => {
    if (cafeLoyalty) {
      const discount = calculateDiscount(cafeId, totalAmount);
      setLoyaltyDiscount(discount);
      onLoyaltyDiscountChange(discount);
    } else {
      setLoyaltyDiscount(0);
      onLoyaltyDiscountChange(0);
    }
  }, [cafeLoyalty, cafeId, totalAmount, calculateDiscount, onLoyaltyDiscountChange]);

  // Calculate maximum redeemable points (50% of order value)
  const calculateMaxRedeemablePoints = () => {
    return Math.floor(totalAmount * 0.5); // 50% of order value
  };

  // Calculate points discount (1 point = ₹1)
  const calculatePointsDiscount = (points: number) => {
    return Math.min(points, calculateMaxRedeemablePoints());
  };

  // Handle points redemption
  const handlePointsRedeem = (points: number) => {
    if (!cafeLoyalty) {
      toast({
        title: "No Loyalty Data",
        description: "You don't have loyalty points for this cafe yet.",
        variant: "destructive"
      });
      return;
    }

    const maxRedeemable = calculateMaxRedeemablePoints();
    const maxAllowed = Math.min(cafeLoyalty.points, maxRedeemable);
    const actualPointsToRedeem = Math.min(points, maxAllowed);
    const discount = calculatePointsDiscount(actualPointsToRedeem);

    setPointsToRedeem(actualPointsToRedeem);
    setPointsDiscount(discount);
    onPointsRedeemChange(actualPointsToRedeem, discount);
  };

  // Handle custom points input
  const handleCustomPointsRedeem = () => {
    const customPoints = parseInt(customPointsInput);
    
    if (!customPoints || customPoints <= 0) {
      toast({
        title: "Invalid Points",
        description: "Please enter a valid number of points.",
        variant: "destructive"
      });
      return;
    }

    if (!cafeLoyalty) {
      toast({
        title: "No Loyalty Data",
        description: "You don't have loyalty points for this cafe yet.",
        variant: "destructive"
      });
      return;
    }

    const maxRedeemable = calculateMaxRedeemablePoints();
    const maxAllowed = Math.min(cafeLoyalty.points, maxRedeemable);

    if (customPoints > maxAllowed) {
      toast({
        title: "Insufficient Points",
        description: `You can only redeem up to ${maxAllowed} points (you have ${cafeLoyalty.points} points, max ${maxRedeemable} for this order).`,
        variant: "destructive"
      });
      return;
    }

    handlePointsRedeem(customPoints);
    setCustomPointsInput('');
  };

  // Clear points redemption
  const clearPointsRedemption = () => {
    setPointsToRedeem(0);
    setPointsDiscount(0);
    onPointsRedeemChange(0, 0);
  };

  // Get level badge color
  const getLevelBadgeColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-blue-100 text-blue-800';
      case 2: return 'bg-purple-100 text-purple-800';
      case 3: return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get level icon
  const getLevelIcon = (level: number) => {
    switch (level) {
      case 1: return <Star className="h-4 w-4" />;
      case 2: return <Gift className="h-4 w-4" />;
      case 3: return <Crown className="h-4 w-4" />;
      default: return <Coffee className="h-4 w-4" />;
    }
  };

  if (!cafeLoyalty) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Coffee className="h-5 w-5 mr-2" />
            Loyalty Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You don't have loyalty points for {cafeName} yet. Place your first order to start earning rewards!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Coffee className="h-5 w-5 mr-2" />
            {cafeName} Loyalty
          </div>
          <Badge className={getLevelBadgeColor(cafeLoyalty.loyalty_level)}>
            {getLevelIcon(cafeLoyalty.loyalty_level)}
            <span className="ml-1">Level {cafeLoyalty.loyalty_level}</span>
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <span className="text-sm font-medium">Points</span>
            </div>
            <div className="text-xl font-bold text-primary">{cafeLoyalty.points}</div>
          </div>
          
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Percent className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm font-medium">Discount</span>
            </div>
            <div className="text-xl font-bold text-green-600">{cafeLoyalty.discount_percentage}%</div>
          </div>
        </div>

        {/* Loyalty Discount */}
        {loyaltyDiscount > 0 && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold">Loyalty Discount Applied!</div>
              <div className="text-sm">
                You're saving ₹{loyaltyDiscount} ({cafeLoyalty.discount_percentage}% off) as a Level {cafeLoyalty.loyalty_level} member.
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Points Redemption */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Redeem Points</Label>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePointsRedeem(50)}
              disabled={!canRedeemPoints(cafeId, 50)}
            >
              50 pts (₹50)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePointsRedeem(100)}
              disabled={!canRedeemPoints(cafeId, 100)}
            >
              100 pts (₹100)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePointsRedeem(200)}
              disabled={!canRedeemPoints(cafeId, 200)}
            >
              200 pts (₹200)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePointsRedeem(500)}
              disabled={!canRedeemPoints(cafeId, 500)}
            >
              500 pts (₹500)
            </Button>
          </div>

          {/* Custom Points Input */}
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Custom points"
              value={customPointsInput}
              onChange={(e) => setCustomPointsInput(e.target.value)}
              min="1"
              max={Math.min(cafeLoyalty.points, calculateMaxRedeemablePoints())}
            />
            <Button
              variant="outline"
              onClick={handleCustomPointsRedeem}
              disabled={!customPointsInput || parseInt(customPointsInput) <= 0}
            >
              Apply
            </Button>
          </div>

          {/* Points Redemption Status */}
          {pointsToRedeem > 0 && (
            <Alert>
              <Gift className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Points Redeemed!</div>
                    <div className="text-sm">
                      {pointsToRedeem} points = ₹{pointsDiscount} discount
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearPointsRedemption}
                  >
                    Clear
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Points Info */}
          <div className="text-xs text-muted-foreground">
            <div>• Maximum redeemable: {Math.min(cafeLoyalty.points, calculateMaxRedeemablePoints())} points (50% of order value)</div>
            <div>• 1 point = ₹1 discount</div>
            <div>• You have {cafeLoyalty.points} points available</div>
          </div>
        </div>

        <Separator />

        {/* Total Savings */}
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-sm font-medium text-green-800 mb-1">Total Savings</div>
          <div className="text-2xl font-bold text-green-600">
            ₹{loyaltyDiscount + pointsDiscount}
          </div>
          <div className="text-xs text-green-600">
            {loyaltyDiscount > 0 && `₹${loyaltyDiscount} loyalty + `}
            {pointsDiscount > 0 && `₹${pointsDiscount} points`}
            {loyaltyDiscount === 0 && pointsDiscount === 0 && 'No discounts applied'}
          </div>
        </div>

        {/* Maintenance Warning (Level 3 only) */}
        {cafeLoyalty.loyalty_level === 3 && !cafeLoyalty.maintenance_met && cafeLoyalty.days_until_month_end <= 7 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold">Maintenance Required!</div>
              <div className="text-sm">
                Spend ₹{Math.max(0, cafeLoyalty.monthly_maintenance_required - cafeLoyalty.monthly_maintenance_spent).toLocaleString()} more in {cafeLoyalty.days_until_month_end} days to maintain Level 3 status.
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
