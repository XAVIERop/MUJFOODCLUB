import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, Gift, TrendingUp, Clock } from 'lucide-react';

interface CafeLoyaltyData {
  cafe_id: string;
  cafe_name: string;
  points: number;
  total_spent: number;
  loyalty_level: number;
  discount_percentage: number;
  monthly_maintenance_spent: number;
  monthly_maintenance_required: number;
  maintenance_met: boolean;
  days_until_month_end: number;
}

interface CafeLoyaltyCardProps {
  loyaltyData: CafeLoyaltyData;
}

export const CafeLoyaltyCard: React.FC<CafeLoyaltyCardProps> = ({ loyaltyData }) => {
  const {
    cafe_name,
    points,
    total_spent,
    loyalty_level,
    discount_percentage,
    monthly_maintenance_spent,
    monthly_maintenance_required,
    maintenance_met,
    days_until_month_end
  } = loyaltyData;

  // Calculate progress to next level
  const getLevelProgress = () => {
    switch (loyalty_level) {
      case 1:
        return {
          current: total_spent,
          target: 2501,
          nextLevel: 'Level 2',
          progress: Math.min((total_spent / 2501) * 100, 100)
        };
      case 2:
        return {
          current: total_spent,
          target: 6001,
          nextLevel: 'Level 3',
          progress: Math.min(((total_spent - 2500) / (6001 - 2500)) * 100, 100)
        };
      case 3:
        return {
          current: total_spent,
          target: null,
          nextLevel: 'Max Level',
          progress: 100
        };
      default:
        return {
          current: total_spent,
          target: 2501,
          nextLevel: 'Level 2',
          progress: Math.min((total_spent / 2501) * 100, 100)
        };
    }
  };

  const levelProgress = getLevelProgress();

  // Get level badge color
  const getLevelBadgeColor = () => {
    switch (loyalty_level) {
      case 1: return 'bg-blue-100 text-blue-800';
      case 2: return 'bg-purple-100 text-purple-800';
      case 3: return 'bg-gold-100 text-gold-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get maintenance status
  const getMaintenanceStatus = () => {
    if (loyalty_level < 3) return null;
    
    const progress = (monthly_maintenance_spent / monthly_maintenance_required) * 100;
    const isWarning = days_until_month_end <= 7 && !maintenance_met;
    
    return {
      progress,
      isWarning,
      status: maintenance_met ? 'met' : 'pending'
    };
  };

  const maintenanceStatus = getMaintenanceStatus();

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{cafe_name}</CardTitle>
          <Badge className={getLevelBadgeColor()}>
            Level {loyalty_level}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Points and Discount */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <span className="text-sm font-medium">Points</span>
            </div>
            <div className="text-2xl font-bold text-primary">{points}</div>
          </div>
          
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Gift className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm font-medium">Discount</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{discount_percentage}%</div>
          </div>
        </div>

        {/* Total Spent */}
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp className="h-4 w-4 text-blue-500 mr-1" />
            <span className="text-sm font-medium">Total Spent</span>
          </div>
          <div className="text-xl font-bold text-blue-600">₹{total_spent.toLocaleString()}</div>
        </div>

        {/* Level Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress to {levelProgress.nextLevel}</span>
            <span>{Math.round(levelProgress.progress)}%</span>
          </div>
          <Progress value={levelProgress.progress} className="h-2" />
          {loyalty_level < 3 && (
            <div className="text-xs text-muted-foreground text-center">
              ₹{Math.max(0, levelProgress.target - levelProgress.current).toLocaleString()} more to reach {levelProgress.nextLevel}
            </div>
          )}
        </div>

        {/* Monthly Maintenance (Level 3 only) */}
        {maintenanceStatus && (
          <div className="space-y-2 p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-orange-500 mr-1" />
                <span className="text-sm font-medium">Monthly Maintenance</span>
              </div>
              <Badge variant={maintenanceStatus.status === 'met' ? 'default' : 'destructive'}>
                {maintenanceStatus.status === 'met' ? 'Met' : 'Pending'}
              </Badge>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>₹{monthly_maintenance_spent.toLocaleString()} / ₹{monthly_maintenance_required.toLocaleString()}</span>
                <span>{Math.round(maintenanceStatus.progress)}%</span>
              </div>
              <Progress 
                value={maintenanceStatus.progress} 
                className={`h-2 ${maintenanceStatus.isWarning ? 'bg-red-200' : ''}`}
              />
              <div className="text-xs text-muted-foreground text-center">
                {days_until_month_end} days left in month
                {maintenanceStatus.isWarning && (
                  <span className="text-red-600 font-medium"> • Warning: Maintenance required!</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Benefits */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Current Benefits</h4>
          <div className="space-y-1">
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span>{discount_percentage}% discount on all orders</span>
            </div>
            {loyalty_level >= 2 && (
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span>Priority customer support</span>
              </div>
            )}
            {loyalty_level >= 3 && (
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                <span>VIP status and exclusive offers</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
