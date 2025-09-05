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

      const { data, error } = await supabase.rpc('get_user_cafe_loyalty_summary', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error fetching loyalty summary:', error);
        setError('Failed to fetch loyalty data');
        return;
      }

      setLoyaltyData(data || []);
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
      const { data, error } = await supabase
        .from('cafe_loyalty_transactions')
        .select(`
          id,
          cafe_id,
          points_change,
          transaction_type,
          description,
          created_at,
          cafes!inner(name)
        `)
        .eq('user_id', user.id)
        .eq('cafe_id', cafeId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching cafe transactions:', error);
        return;
      }

      const formattedTransactions: CafeLoyaltyTransaction[] = data.map(transaction => ({
        id: transaction.id,
        cafe_id: transaction.cafe_id,
        cafe_name: transaction.cafes.name,
        points_change: transaction.points_change,
        transaction_type: transaction.transaction_type,
        description: transaction.description,
        created_at: transaction.created_at
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
