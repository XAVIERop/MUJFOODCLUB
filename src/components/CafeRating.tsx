import React, { useState, useEffect } from 'react';
import { Star, StarOff } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useToast } from '../hooks/use-toast';

interface CafeRatingProps {
  cafeId: string;
  currentRating?: number;
  averageRating?: number;
  totalRatings?: number;
  onRatingChange?: (newRating: number) => void;
}

export const CafeRating: React.FC<CafeRatingProps> = ({
  cafeId,
  currentRating = 0,
  averageRating = 0,
  totalRatings = 0,
  onRatingChange
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(currentRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserRating();
    }
  }, [user, cafeId]);

  const fetchUserRating = async () => {
    try {
      const { data, error } = await supabase
        .from('cafe_ratings')
        .select('rating, review')
        .eq('cafe_id', cafeId)
        .eq('user_id', user?.id)
        .single();

      if (data) {
        setUserRating(data.rating);
        setRating(data.rating);
        setReview(data.review || '');
      }
    } catch (error) {
      // User hasn't rated yet
      setUserRating(null);
    }
  };

  const handleRatingSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to rate this cafe.",
        variant: "destructive"
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('cafe_ratings')
        .upsert({
          cafe_id: cafeId,
          user_id: user.id,
          rating,
          review: review.trim() || null,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Rating Submitted!",
        description: `Thank you for rating this cafe ${rating} stars!`,
      });

      setUserRating(rating);
      onRatingChange?.(rating);
      
      // Refresh the page to show updated average rating
      setTimeout(() => window.location.reload(), 1000);

    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingClick = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleRatingHover = (hoverRating: number) => {
    setHoverRating(hoverRating);
  };

  const handleRatingLeave = () => {
    setHoverRating(0);
  };

  const renderStars = (rating: number, isInteractive: boolean = false) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= rating;
      const isHovered = starValue <= hoverRating;

      return (
        <button
          key={index}
          type="button"
          className={`p-1 transition-colors ${
            isInteractive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
          }`}
          onClick={isInteractive ? () => handleRatingClick(starValue) : undefined}
          onMouseEnter={isInteractive ? () => handleRatingHover(starValue) : undefined}
          onMouseLeave={isInteractive ? handleRatingLeave : undefined}
          disabled={!isInteractive || isSubmitting}
        >
          {isFilled || isHovered ? (
            <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
          ) : (
            <StarOff className="w-6 h-6 text-gray-300" />
          )}
        </button>
      );
    });
  };

  if (!user) {
    return (
      <div className="text-center p-4">
        <p className="text-sm text-gray-600 mb-2">Sign in to rate this cafe</p>
        <div className="flex justify-center items-center gap-1">
          {renderStars(averageRating)}
          <span className="ml-2 text-sm text-gray-600">
            ({averageRating.toFixed(1)} • {totalRatings} ratings)
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Average Rating Display */}
      <div className="text-center">
        <div className="flex justify-center items-center gap-1 mb-2">
          {renderStars(averageRating)}
        </div>
        <p className="text-sm text-gray-600">
          {averageRating.toFixed(1)} out of 5 • {totalRatings} ratings
        </p>
      </div>

      {/* User Rating Section */}
      <div className="border-t pt-4">
        <h4 className="font-medium mb-3">
          {userRating ? 'Update Your Rating' : 'Rate This Cafe'}
        </h4>
        
        {/* Interactive Stars */}
        <div className="flex justify-center mb-3">
          {renderStars(rating, true)}
        </div>
        
        <p className="text-center text-sm text-gray-600 mb-3">
          {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Select rating'}
        </p>

        {/* Review Textarea */}
        <div className="mb-3">
          <Textarea
            placeholder="Write a review (optional)..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="min-h-[80px]"
            disabled={isSubmitting}
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleRatingSubmit}
          disabled={rating === 0 || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Submitting...' : userRating ? 'Update Rating' : 'Submit Rating'}
        </Button>
      </div>
    </div>
  );
};
