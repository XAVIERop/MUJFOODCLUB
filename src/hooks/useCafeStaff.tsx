import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface CafeStaff {
  id: string;
  cafe_id: string;
  user_id: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined with profiles to get staff name
  profile?: {
    full_name: string;
    email: string;
    phone: string | null;
  };
}

export const useCafeStaff = (cafeId?: string) => {
  const { user, profile } = useAuth();
  const [staff, setStaff] = useState<CafeStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStaff = async () => {
    if (!cafeId) {
      setStaff([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('cafe_staff')
        .select(`
          *,
          profile:user_id (
            full_name,
            email,
            phone
          )
        `)
        .eq('cafe_id', cafeId)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setStaff(data || []);
    } catch (err) {
      console.error('Error fetching cafe staff:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  };

  const addStaff = async (staffData: {
    user_id: string;
    role: string;
  }) => {
    if (!cafeId) {
      throw new Error('Cafe ID is required');
    }

    try {
      const { data, error: insertError } = await supabase
        .from('cafe_staff')
        .insert({
          cafe_id: cafeId,
          user_id: staffData.user_id,
          role: staffData.role,
          is_active: true
        })
        .select(`
          *,
          profile:user_id (
            full_name,
            email,
            phone
          )
        `)
        .single();

      if (insertError) {
        throw insertError;
      }

      setStaff(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Error adding staff:', err);
      throw err;
    }
  };

  const updateStaff = async (staffId: string, updates: {
    role?: string;
    is_active?: boolean;
  }) => {
    try {
      const { data, error: updateError } = await supabase
        .from('cafe_staff')
        .update(updates)
        .eq('id', staffId)
        .select(`
          *,
          profile:user_id (
            full_name,
            email,
            phone
          )
        `)
        .single();

      if (updateError) {
        throw updateError;
      }

      setStaff(prev => prev.map(s => s.id === staffId ? data : s));
      return data;
    } catch (err) {
      console.error('Error updating staff:', err);
      throw err;
    }
  };

  const removeStaff = async (staffId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('cafe_staff')
        .update({ is_active: false })
        .eq('id', staffId);

      if (deleteError) {
        throw deleteError;
      }

      setStaff(prev => prev.filter(s => s.id !== staffId));
    } catch (err) {
      console.error('Error removing staff:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [cafeId]);

  return {
    staff,
    loading,
    error,
    fetchStaff,
    addStaff,
    updateStaff,
    removeStaff
  };
};
