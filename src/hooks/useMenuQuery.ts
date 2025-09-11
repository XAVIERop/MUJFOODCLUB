import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryClient';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  is_available: boolean;
  preparation_time: number;
  cafe_id: string;
  created_at: string;
  updated_at: string;
}

export const useMenuQuery = (cafeId: string) => {
  return useQuery({
    queryKey: queryKeys.cafeMenu(cafeId),
    queryFn: async (): Promise<MenuItem[]> => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('cafe_id', cafeId)
        .eq('is_available', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching menu:', error);
        throw new Error(`Failed to fetch menu: ${error.message}`);
      }

      return data || [];
    },
    enabled: !!cafeId,
    // Cache menu for 5 minutes since it changes less frequently
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
};
