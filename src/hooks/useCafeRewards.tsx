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

      // Since we reset all data, show empty state for now
      // This will be populated as users place new orders
      setCafeRewards([]);
      setTransactions([]);

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
