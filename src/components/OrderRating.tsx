import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Star, StarOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OrderRatingProps {
  orderId: string;
  orderNumber: string;
  cafeName: string;
  onRatingSubmitted?: () => void;
}

export const OrderRating: React.FC<OrderRatingProps> = ({
  orderId,
  orderNumber,
  cafeName,
  onRatingSubmitted
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { toast } = useToast();

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
          className={`transition-colors duration-200 ${
            isInteractive ? 'cursor-pointer' : 'cursor-default'
          }`}
          onClick={isInteractive ? () => handleRatingClick(starValue) : undefined}
          onMouseEnter={isInteractive ? () => handleRatingHover(starValue) : undefined}
          onMouseLeave={isInteractive ? handleRatingLeave : undefined}
        >
          {isFilled || isHovered ? (
            <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
          ) : (
            <StarOff className="w-8 h-8 text-gray-300" />
          )}
        </button>
      );
    });
  };

  const handleSubmitRating = async () => {
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
      console.log('Starting rating submission for order:', orderId);
      
      // Insert order rating
      const { data: ratingData, error: ratingError } = await (supabase
        .from('order_ratings')
        .insert({
          order_id: orderId,
          rating,
          review: review.trim() || null,
          created_at: new Date().toISOString()
        }) as any);

      console.log('Rating insert result:', { ratingData, ratingError });

      if (ratingError) {
        console.error('Error submitting rating:', ratingError);
        throw ratingError;
      }

      console.log('Rating inserted successfully, updating order status...');

      // Get cafe_id from the order to create cafe rating
      const { data: orderData, error: orderFetchError } = await supabase
        .from('orders')
        .select('cafe_id')
        .eq('id', orderId)
        .single();

      if (orderFetchError) {
        console.error('Error fetching order for cafe_id:', orderFetchError);
        // Don't fail the rating submission for this error
      } else if (orderData && orderData.cafe_id) {
        // Create or update cafe rating
        const { error: cafeRatingError } = await (supabase
          .from('cafe_ratings')
          .upsert({
            cafe_id: orderData.cafe_id,
            user_id: (await supabase.auth.getUser()).data.user?.id,
            rating,
            review: review.trim() || null,
            created_at: new Date().toISOString()
          }, {
            onConflict: 'cafe_id,user_id'
          }) as any);

        if (cafeRatingError) {
          console.error('Error creating cafe rating:', cafeRatingError);
          // Don't fail the rating submission for this error
        } else {
          console.log('Cafe rating created/updated successfully');
        }
      }

      // Update order to mark as rated
      const { data: updateData, error: updateError } = await (supabase
        .from('orders')
        .update({ 
          has_rating: true,
          rating_submitted_at: new Date().toISOString()
        })
        .eq('id', orderId) as any);

      console.log('Order update result:', { updateData, updateError });

      if (updateError) {
        console.error('Error updating order rating status:', updateError);
        // Don't fail the rating submission for this error
      }

      console.log('Rating submission completed successfully!');

      toast({
        title: "Rating Submitted!",
        description: `Thank you for rating your order ${rating} stars!`,
      });

      setHasSubmitted(true);
      onRatingSubmitted?.();

    } catch (error) {
      console.error('Detailed rating error:', error);
      
      // Show more specific error message
      let errorMessage = "Failed to submit rating. Please try again.";
      
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = `Rating failed: ${error.message}`;
      } else if (error && typeof error === 'string') {
        errorMessage = `Rating failed: ${error}`;
      }
      
      toast({
        title: "Rating Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasSubmitted) {
    return (
      <Card className="food-card">
        <CardHeader>
          <CardTitle className="flex items-center text-green-600">
            <Star className="w-5 h-5 mr-2" />
            Rating Submitted Successfully!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Thank you for rating your order from {cafeName}. Your feedback helps us improve our service!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="food-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Star className="w-5 h-5 mr-2 text-yellow-500" />
          Rate Your Order
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            How was your order from {cafeName}? (Order #{orderNumber})
          </p>
          
          {/* Interactive Stars */}
          <div className="flex justify-center space-x-1">
            {renderStars(rating, true)}
          </div>
          
          {rating > 0 && (
            <p className="text-center text-sm text-muted-foreground mt-2">
              You rated this order {rating} star{rating !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="review" className="block text-sm font-medium mb-2">
            Review (Optional)
          </label>
          <Textarea
            id="review"
            placeholder="Share your experience with this order..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={3}
          />
        </div>

        <Button
          onClick={handleSubmitRating}
          disabled={isSubmitting || rating === 0}
          className="w-full"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Rating'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default OrderRating;
