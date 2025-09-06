import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface CafeLoyaltyData {
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

export interface CafeLoyaltyTransaction {
  id: string;
  cafe_id: string;
  cafe_name: string;
  points_change: number;
  transaction_type: string;
  description: string;
  created_at: string;
}

export const useCafeLoyalty = () => {
  const { user } = useAuth();
  const [loyaltyData, setLoyaltyData] = useState<CafeLoyaltyData[]>([]);
  const [transactions, setTransactions] = useState<CafeLoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's cafe loyalty summary
  const fetchLoyaltySummary = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Get user's profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setError('Failed to fetch user profile');
        return;
      }

      // Get user's orders to calculate cafe-specific data
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          cafe_id,
          total_amount,
          created_at,
          cafes!inner(id, name)
        `)
        .eq('user_id', user.id)
        .eq('status', 'completed');

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        setError('Failed to fetch order history');
        return;
      }

      // Calculate cafe-specific loyalty data
      const cafeData: { [key: string]: any } = {};
      
      orders.forEach((order: any) => {
        const cafeId = order.cafe_id;
        if (!cafeData[cafeId]) {
          cafeData[cafeId] = {
            cafe_id: cafeId,
            cafe_name: order.cafes.name,
            points: 0,
            total_spent: 0,
            loyalty_level: 1,
            discount_percentage: 5,
            monthly_maintenance_spent: 0,
            monthly_maintenance_required: 0,
            maintenance_met: true,
            days_until_month_end: 30
          };
        }
        
        cafeData[cafeId].total_spent += parseFloat(order.total_amount);
        // Simple points calculation: 1 point per ₹10 spent
        cafeData[cafeId].points += Math.floor(parseFloat(order.total_amount) / 10);
      });

      // Calculate loyalty levels and discounts
      Object.values(cafeData).forEach((cafe: any) => {
        if (cafe.total_spent >= 5000) {
          cafe.loyalty_level = 3;
          cafe.discount_percentage = 20;
        } else if (cafe.total_spent >= 2000) {
          cafe.loyalty_level = 2;
          cafe.discount_percentage = 10;
        } else {
          cafe.loyalty_level = 1;
          cafe.discount_percentage = 5;
        }
      });

      setLoyaltyData(Object.values(cafeData));
    } catch (err) {
      console.error('Exception fetching loyalty summary:', err);
      setError('Failed to fetch loyalty data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch loyalty transactions for a specific cafe
  const fetchCafeTransactions = async (cafeId: string, limit: number = 10) => {
    if (!user) return;

    try {
      // Get orders for the specific cafe to create transaction history
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id,
          cafe_id,
          total_amount,
          points_earned,
          created_at,
          cafes!inner(name)
        `)
        .eq('user_id', user.id)
        .eq('cafe_id', cafeId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching cafe transactions:', error);
        return;
      }

      const formattedTransactions: CafeLoyaltyTransaction[] = orders.map((order: any) => ({
        id: order.id,
        cafe_id: order.cafe_id,
        cafe_name: order.cafes.name,
        points_change: order.points_earned || Math.floor(parseFloat(order.total_amount) / 10),
        transaction_type: 'order',
        description: `Order completed - ₹${parseFloat(order.total_amount).toFixed(2)}`,
        created_at: order.created_at
      }));

      setTransactions(formattedTransactions);
    } catch (err) {
      console.error('Exception fetching cafe transactions:', err);
    }
  };

  // Get loyalty data for a specific cafe
  const getCafeLoyalty = (cafeId: string): CafeLoyaltyData | null => {
    return loyaltyData.find(data => data.cafe_id === cafeId) || null;
  };

  // Calculate discount amount for an order
  const calculateDiscount = (cafeId: string, orderAmount: number): number => {
    const cafeLoyalty = getCafeLoyalty(cafeId);
    if (!cafeLoyalty) return 0;

    return Math.floor((orderAmount * cafeLoyalty.discount_percentage) / 100);
  };

  // Check if user can redeem points at a cafe
  const canRedeemPoints = (cafeId: string, pointsToRedeem: number): boolean => {
    const cafeLoyalty = getCafeLoyalty(cafeId);
    if (!cafeLoyalty) return false;

    return cafeLoyalty.points >= pointsToRedeem;
  };

  // Get total points across all cafes
  const getTotalPoints = (): number => {
    return loyaltyData.reduce((total, data) => total + data.points, 0);
  };

  // Get total spent across all cafes
  const getTotalSpent = (): number => {
    return loyaltyData.reduce((total, data) => total + data.total_spent, 0);
  };

  // Get highest loyalty level across all cafes
  const getHighestLoyaltyLevel = (): number => {
    return Math.max(...loyaltyData.map(data => data.loyalty_level), 0);
  };

  // Check if user has any maintenance warnings
  const hasMaintenanceWarnings = (): boolean => {
    return loyaltyData.some(data => 
      data.loyalty_level === 3 && 
      !data.maintenance_met && 
      data.days_until_month_end <= 7
    );
  };

  // Get cafes with maintenance warnings
  const getMaintenanceWarnings = (): CafeLoyaltyData[] => {
    return loyaltyData.filter(data => 
      data.loyalty_level === 3 && 
      !data.maintenance_met && 
      data.days_until_month_end <= 7
    );
  };

  // Refresh loyalty data
  const refreshLoyaltyData = () => {
    fetchLoyaltySummary();
  };

  // Initialize on mount
  useEffect(() => {
    if (user) {
      fetchLoyaltySummary();
    }
  }, [user]);

  return {
    loyaltyData,
    transactions,
    loading,
    error,
    fetchLoyaltySummary,
    fetchCafeTransactions,
    getCafeLoyalty,
    calculateDiscount,
    canRedeemPoints,
    getTotalPoints,
    getTotalSpent,
    getHighestLoyaltyLevel,
    hasMaintenanceWarnings,
    getMaintenanceWarnings,
    refreshLoyaltyData
  };
};
