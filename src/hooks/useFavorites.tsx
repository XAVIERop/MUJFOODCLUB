import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from './useAuth';

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await (supabase
        .from('user_favorites')
        .select('cafe_id')
        .eq('user_id', user.id) as any);

      if (error) throw error;

      const cafeIds = data?.map((fav: any) => fav.cafe_id) || [];
      setFavorites(cafeIds);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (cafeId: string): Promise<boolean> => {
    console.log('=== FAVORITES DEBUG START ===');
    console.log('User:', user);
    console.log('User ID:', user?.id);
    console.log('Cafe ID:', cafeId);
    console.log('Current favorites:', favorites);
    
    if (!user) {
      console.log('No user found, cannot toggle favorite');
      return false;
    }

    try {
      const isFavorite = favorites.includes(cafeId);
      console.log('Is currently favorite?', isFavorite);

      if (isFavorite) {
        console.log('Removing from favorites...');
        // Remove from favorites
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('cafe_id', cafeId);

        console.log('Delete result:', { error });

        if (error) throw error;

        setFavorites(prev => prev.filter(id => id !== cafeId));
        console.log('Removed from favorites successfully');
        return false;
      } else {
        console.log('Adding to favorites...');
        // Add to favorites
        const { data, error } = await (supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            cafe_id: cafeId
          }) as any);

        console.log('Insert result:', { data, error });

        if (error) throw error;

        setFavorites(prev => [...prev, cafeId]);
        console.log('Added to favorites successfully');
        return true;
      }
    } catch (error) {
      console.error('=== FAVORITES ERROR ===');
      console.error('Error details:', error);
      console.error('Error message:', error?.message);
      console.error('Error code:', error?.code);
      console.error('Error details:', error?.details);
      return false;
    }
  };

  const isFavorite = (cafeId: string): boolean => {
    return favorites.includes(cafeId);
  };

  const getFavoriteCafes = async () => {
    if (!user) return [];

    try {
      const { data, error } = await (supabase
        .from('user_favorites')
        .select(`
          cafe_id,
          cafes (
            id,
            name,
            type,
            description,
            location,
            phone,
            hours,
            accepting_orders,
            average_rating,
            total_ratings,
            cuisine_categories
          )
        `)
        .eq('user_id', user.id) as any);

      if (error) throw error;

      return data?.map((fav: any) => fav.cafes).filter(Boolean) || [];
    } catch (error) {
      console.error('Error fetching favorite cafes:', error);
      return [];
    }
  };

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorite,
    getFavoriteCafes,
    refreshFavorites: fetchFavorites
  };
};
