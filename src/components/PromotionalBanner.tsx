import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PromotionalBannerProps {
  banners: PromotionalBannerData[];
  onClose?: () => void;
  onDismiss?: (bannerId: string) => void;
}

interface PromotionalBannerData {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  discount?: string;
  image_url?: string;
  button_text?: string;
  button_action?: string;
  background_color?: string;
  text_color?: string;
  is_active: boolean;
  priority: number;
  cafe_id?: string;
  start_date?: string;
  end_date?: string;
}

const PromotionalBanner: React.FC<PromotionalBannerProps> = ({ 
  banners, 
  onClose, 
  onDismiss 
}) => {
  const [currentBannerIndex, setCurrentBannerIndex] = React.useState(0);
  const [isVisible, setIsVisible] = React.useState(true);

  // Filter active banners and sort by priority
  const activeBanners = banners
    .filter(banner => banner.is_active)
    .sort((a, b) => b.priority - a.priority);

  if (!isVisible || activeBanners.length === 0) {
    return null;
  }

  const currentBanner = activeBanners[currentBannerIndex];

  const handleClose = () => {
    if (onDismiss) {
      onDismiss(currentBanner.id);
    }
    setIsVisible(false);
  };

  const handlePrevious = () => {
    setCurrentBannerIndex((prev) => 
      prev === 0 ? activeBanners.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentBannerIndex((prev) => 
      prev === activeBanners.length - 1 ? 0 : prev + 1
    );
  };

  const handleButtonClick = () => {
    if (currentBanner.buttonAction) {
      currentBanner.buttonAction();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl shadow-lg mb-6">
      {/* Background with gradient */}
      <div 
        className={cn(
          "relative p-6 text-white",
          currentBanner.background_color || "bg-gradient-to-r from-orange-500 to-red-500"
        )}
      >
        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="absolute top-2 right-2 text-white hover:bg-white/20 w-8 h-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="flex items-center justify-between">
          {/* Content */}
          <div className="flex-1 pr-4">
            {/* Discount Badge */}
            {currentBanner.discount && (
              <Badge 
                className="mb-2 bg-white/20 text-white border-white/30"
                variant="outline"
              >
                {currentBanner.discount}
              </Badge>
            )}

            {/* Title */}
            <h3 className="text-xl font-bold mb-1">
              {currentBanner.title}
            </h3>

            {/* Subtitle */}
            {currentBanner.subtitle && (
              <p className="text-sm opacity-90 mb-2">
                {currentBanner.subtitle}
              </p>
            )}

            {/* Description */}
            <p className="text-sm opacity-80 mb-4">
              {currentBanner.description}
            </p>

            {/* Action Button */}
            {currentBanner.button_text && (
              <Button
                onClick={handleButtonClick}
                className="bg-white text-orange-600 hover:bg-white/90 font-medium"
                size="sm"
              >
                {currentBanner.button_text}
              </Button>
            )}
          </div>

          {/* Image */}
          {currentBanner.image_url && (
            <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={currentBanner.image_url}
                alt={currentBanner.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Navigation Dots */}
        {activeBanners.length > 1 && (
          <div className="flex items-center justify-center mt-4 space-x-2">
            {activeBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBannerIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-200",
                  index === currentBannerIndex
                    ? "bg-white"
                    : "bg-white/40 hover:bg-white/60"
                )}
              />
            ))}
          </div>
        )}

        {/* Navigation Arrows */}
        {activeBanners.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 w-8 h-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 w-8 h-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default PromotionalBanner;
