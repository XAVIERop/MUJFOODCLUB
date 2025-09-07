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

      // Fetch cafe-specific loyalty points from the proper table
      const { data: loyaltyData, error: loyaltyError } = await supabase
        .from('cafe_loyalty_points')
        .select(`
          cafe_id,
          points,
          total_spent,
          loyalty_level,
          cafe:cafes(name)
        `)
        .eq('user_id', user.id);

      if (loyaltyError) {
        console.error('Error fetching cafe loyalty points:', loyaltyError);
        throw loyaltyError;
      }

      console.log('📋 Found cafe loyalty data:', loyaltyData?.length || 0);

      // Fetch user's orders for monthly spend calculation and transactions
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

      // Group orders by cafe for monthly spend calculation
      const cafeOrderData: { [cafeId: string]: any } = {};
      const cafeTransactions: CafeTransaction[] = [];

      (orders || []).forEach(order => {
        const cafeId = order.cafe_id;
        
        if (!cafeOrderData[cafeId]) {
          cafeOrderData[cafeId] = {
            total_orders: 0,
            monthly_spend: 0
          };
        }

        cafeOrderData[cafeId].total_orders += 1;

        // Calculate monthly spend (current month)
        const orderDate = new Date(order.created_at);
        const currentDate = new Date();
        const isCurrentMonth = orderDate.getMonth() === currentDate.getMonth() && 
                              orderDate.getFullYear() === currentDate.getFullYear();
        
        if (isCurrentMonth) {
          cafeOrderData[cafeId].monthly_spend += order.total_amount;
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

      // Convert loyalty data to rewards data
      const rewardsData: CafeRewardData[] = (loyaltyData || []).map((loyalty: any) => {
        const cafeId = loyalty.cafe_id;
        const orderData = cafeOrderData[cafeId] || { total_orders: 0, monthly_spend: 0 };
        
        return {
          cafe_id: cafeId,
          cafe_name: loyalty.cafe?.name || 'Unknown Cafe',
          points: loyalty.points || 0,
          tier: getTierByMonthlySpend(orderData.monthly_spend),
          monthly_spend: orderData.monthly_spend,
          total_spend: loyalty.total_spent || 0,
          total_orders: orderData.total_orders,
          discount_percentage: getTierDiscount(getTierByMonthlySpend(orderData.monthly_spend)),
          is_first_order: orderData.total_orders === 1
        };
      });

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
