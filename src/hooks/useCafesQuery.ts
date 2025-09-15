import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryClient';

export interface Cafe {
  id: string;
  name: string;
  type: string;
  description: string;
  location: string;
  phone: string;
  hours: string;
  image_url: string | null;
  rating: number;
  total_reviews: number;
  is_active: boolean;
  accepting_orders: boolean;
  priority: number | null;
  created_at: string;
  updated_at: string;
}

export const useCafesQuery = () => {
  return useQuery({
    queryKey: queryKeys.cafes,
    queryFn: async (): Promise<Cafe[]> => {
      const { data, error } = await supabase
        .rpc('get_cafes_ordered');

      if (error) {
        console.error('Error fetching cafes:', error);
        throw new Error(`Failed to fetch cafes: ${error.message}`);
      }

      return data || [];
    },
    // Cache cafes for 10 minutes since they don't change often
    staleTime: 10 * 60 * 1000,
    // Keep in cache for 30 minutes
    gcTime: 30 * 60 * 1000,
  });
};

export const useCafeQuery = (cafeId: string) => {
  return useQuery({
    queryKey: queryKeys.cafe(cafeId),
    queryFn: async (): Promise<Cafe | null> => {
      const { data, error } = await supabase
        .from('cafes')
        .select('*')
        .eq('id', cafeId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching cafe:', error);
        throw new Error(`Failed to fetch cafe: ${error.message}`);
      }

      return data;
    },
    enabled: !!cafeId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};
