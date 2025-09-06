import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { CAFE_REWARDS, getTierByMonthlySpend, getTierDiscount } from '@/lib/constants';

export interface CafeRewardData {
  cafe_id: string;
  cafe_name: string;
  points: number;
  tier: string;
  monthly_spend: number;
  total_spend: number;
  total_orders: number;
  discount_percentage: number;
  is_first_order: boolean;
}

export interface CafeTransaction {
  id: string;
  cafe_id: string;
  cafe_name: string;
  order_amount: number;
  points_earned: number;
  created_at: string;
}

export const useCafeRewards = () => {
  const { user } = useAuth();
  const [cafeRewards, setCafeRewards] = useState<CafeRewardData[]>([]);
  const [transactions, setTransactions] = useState<CafeTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCafeRewards = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Get current month start date
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthStartISO = monthStart.toISOString();

      // Fetch all completed orders for the user
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          cafe_id,
          total_amount,
          points_earned,
          created_at,
          cafes!inner(id, name)
        `)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Group orders by cafe and calculate rewards
      const cafeData: { [key: string]: CafeRewardData } = {};
      const allTransactions: CafeTransaction[] = [];

      orders?.forEach((order: any) => {
        const cafeId = order.cafe_id;
        const cafeName = order.cafes.name;
        const orderAmount = parseFloat(order.total_amount);
        const orderDate = new Date(order.created_at);
        const isThisMonth = orderDate >= monthStart;

        // Initialize cafe data if not exists
        if (!cafeData[cafeId]) {
          cafeData[cafeId] = {
            cafe_id: cafeId,
            cafe_name: cafeName,
            points: 0,
            tier: CAFE_REWARDS.TIERS.FOODIE,
            monthly_spend: 0,
            total_spend: 0,
            total_orders: 0,
            discount_percentage: CAFE_REWARDS.TIER_DISCOUNTS.FOODIE,
            is_first_order: false
          };
        }

        // Add to totals
        cafeData[cafeId].total_spend += orderAmount;
        cafeData[cafeId].total_orders += 1;
        
        if (isThisMonth) {
          cafeData[cafeId].monthly_spend += orderAmount;
        }

        // Add points (use existing points_earned or calculate)
        const pointsEarned = order.points_earned || Math.floor(orderAmount * CAFE_REWARDS.POINTS_RATE);
        cafeData[cafeId].points += pointsEarned;

        // Add transaction
        allTransactions.push({
          id: order.id,
          cafe_id: cafeId,
          cafe_name: cafeName,
          order_amount: orderAmount,
          points_earned: pointsEarned,
          created_at: order.created_at
        });
      });

      // Calculate tiers and check for first orders
      Object.values(cafeData).forEach((cafe) => {
        // Determine tier based on monthly spend
        cafe.tier = getTierByMonthlySpend(cafe.monthly_spend);
        cafe.discount_percentage = getTierDiscount(cafe.tier);

        // Check if this is the first order at this cafe
        const cafeOrders = orders?.filter((order: any) => order.cafe_id === cafe.cafe_id) || [];
        cafe.is_first_order = cafeOrders.length === 1;
      });

      setCafeRewards(Object.values(cafeData));
      setTransactions(allTransactions);

    } catch (err) {
      console.error('Error fetching cafe rewards:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch rewards data');
    } finally {
      setLoading(false);
    }
  };

  const getCafeRewardData = (cafeId: string): CafeRewardData | null => {
    return cafeRewards.find(cafe => cafe.cafe_id === cafeId) || null;
  };

  const getCafeTransactions = (cafeId: string, limit: number = 10): CafeTransaction[] => {
    return transactions
      .filter(transaction => transaction.cafe_id === cafeId)
      .slice(0, limit);
  };

  const refreshRewards = () => {
    fetchCafeRewards();
  };

  useEffect(() => {
    if (user) {
      fetchCafeRewards();
    }
  }, [user]);

  return {
    cafeRewards,
    transactions,
    loading,
    error,
    getCafeRewardData,
    getCafeTransactions,
    refreshRewards
  };
};
