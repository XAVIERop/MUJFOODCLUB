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
      const { data, error } = await supabase
        .from('user_favorites')
        .select('cafe_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const cafeIds = data?.map(fav => fav.cafe_id) || [];
      setFavorites(cafeIds);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (cafeId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const isFavorite = favorites.includes(cafeId);

      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('cafe_id', cafeId);

        if (error) throw error;

        setFavorites(prev => prev.filter(id => id !== cafeId));
        return false;
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            cafe_id: cafeId
          });

        if (error) throw error;

        setFavorites(prev => [...prev, cafeId]);
        return true;
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  };

  const isFavorite = (cafeId: string): boolean => {
    return favorites.includes(cafeId);
  };

  const getFavoriteCafes = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
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
        .eq('user_id', user.id);

      if (error) throw error;

      return data?.map(fav => fav.cafes).filter(Boolean) || [];
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
