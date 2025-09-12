import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Cafe {
  id: string;
  name: string;
  description: string;
  image_url: string;
  average_rating: number;
  total_ratings: number;
  priority: number;
  accepting_orders: boolean;
  is_exclusive: boolean;
  created_at: string;
  updated_at: string;
}

// Query key factory for cafes
export const cafeKeys = {
  all: ['cafes'] as const,
  lists: () => [...cafeKeys.all, 'list'] as const,
  list: (filters: string) => [...cafeKeys.lists(), { filters }] as const,
  details: () => [...cafeKeys.all, 'detail'] as const,
  detail: (id: string) => [...cafeKeys.details(), id] as const,
};

// Hook to fetch all cafes with priority ordering
export const useCafesQuery = (options?: {
  enabled?: boolean;
  staleTime?: number;
}) => {
  return useQuery({
    queryKey: cafeKeys.lists(),
    queryFn: async (): Promise<Cafe[]> => {
      console.log('🔄 Fetching cafes directly from table...');
      
      // Temporarily bypass the function and query directly
      const { data, error } = await supabase
        .from('cafes')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: true })
        .order('average_rating', { ascending: false, nullsLast: true })
        .order('total_ratings', { ascending: false, nullsLast: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching cafes:', error);
        throw new Error(`Failed to fetch cafes: ${error.message}`);
      }

      const cafes = Array.isArray(data) ? data : [];
      console.log(`✅ Fetched ${cafes.length} cafes directly from table`);
      
      return cafes;
    },
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: options?.enabled !== false,
    retry: 2,
  });
};

// Hook to fetch a specific cafe by ID
export const useCafeQuery = (cafeId: string | null, options?: {
  enabled?: boolean;
  staleTime?: number;
}) => {
  return useQuery({
    queryKey: cafeKeys.detail(cafeId || ''),
    queryFn: async (): Promise<Cafe | null> => {
      if (!cafeId) return null;
      
      console.log('🔄 Fetching cafe details for:', cafeId);
      
      const { data, error } = await supabase
        .from('cafes')
        .select('*')
        .eq('id', cafeId)
        .single();

      if (error) {
        console.error('Error fetching cafe:', error);
        throw new Error(`Failed to fetch cafe: ${error.message}`);
      }

      console.log('✅ Fetched cafe details:', data?.name);
      return data;
    },
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: options?.enabled !== false && !!cafeId,
    retry: 2,
  });
};

// Hook to prefetch cafes data
export const usePrefetchCafes = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: cafeKeys.lists(),
      queryFn: async (): Promise<Cafe[]> => {
        const { data, error } = await supabase
          .from('cafes')
          .select('*')
          .eq('is_active', true)
          .order('priority', { ascending: true })
          .order('average_rating', { ascending: false, nullsLast: true })
          .order('total_ratings', { ascending: false, nullsLast: true })
          .order('name', { ascending: true });

        if (error) {
          throw new Error(`Failed to prefetch cafes: ${error.message}`);
        }

        return Array.isArray(data) ? data : [];
      },
      staleTime: 5 * 60 * 1000,
    });
  };
};

// Hook to invalidate cafes cache
export const useInvalidateCafes = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: cafeKeys.all });
  };
};
