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

      console.log('🔄 Fetching cafe-specific rewards for user:', user.id);

      // Fetch user's orders with cafe information
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          cafe_id,
          total_amount,
          points_earned,
          created_at,
          status,
          cafe:cafes(name)
        `)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        throw ordersError;
      }

      console.log('📋 Found orders:', orders?.length || 0);

      // Group orders by cafe
      const cafeData: { [cafeId: string]: any } = {};
      const cafeTransactions: CafeTransaction[] = [];

      (orders || []).forEach(order => {
        const cafeId = order.cafe_id;
        
        if (!cafeData[cafeId]) {
          cafeData[cafeId] = {
            cafe_id: cafeId,
            cafe_name: order.cafe?.name || 'Unknown Cafe',
            total_spend: 0,
            total_orders: 0,
            monthly_spend: 0,
            points: 0
          };
        }

        // Add to totals
        cafeData[cafeId].total_spend += order.total_amount;
        cafeData[cafeId].total_orders += 1;
        cafeData[cafeId].points += order.points_earned || 0;

        // Calculate monthly spend (current month)
        const orderDate = new Date(order.created_at);
        const currentDate = new Date();
        const isCurrentMonth = orderDate.getMonth() === currentDate.getMonth() && 
                              orderDate.getFullYear() === currentDate.getFullYear();
        
        if (isCurrentMonth) {
          cafeData[cafeId].monthly_spend += order.total_amount;
        }

        // Add transaction
        cafeTransactions.push({
          id: order.id,
          cafe_id: cafeId,
          cafe_name: order.cafe?.name || 'Unknown Cafe',
          order_amount: order.total_amount,
          points_earned: order.points_earned || 0,
          created_at: order.created_at
        });
      });

      // Convert to array and calculate tiers
      const rewardsData: CafeRewardData[] = Object.values(cafeData).map((cafe: any) => ({
        ...cafe,
        tier: getTierByMonthlySpend(cafe.monthly_spend),
        discount_percentage: getTierDiscount(getTierByMonthlySpend(cafe.monthly_spend)),
        is_first_order: cafe.total_orders === 1
      }));

      console.log('🎯 Calculated cafe rewards:', rewardsData);
      console.log('📊 Transactions:', cafeTransactions);

      setCafeRewards(rewardsData);
      setTransactions(cafeTransactions);

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
