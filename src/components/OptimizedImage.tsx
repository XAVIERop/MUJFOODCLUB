import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { getImageUrl, getOptimizedImageUrl } from '@/utils/imageSource';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  placeholder?: string;
  fallback?: string;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  sizes?: string;
  priority?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  loading = 'lazy',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4=',
  fallback,
  quality = 100, // 100% quality by default
  format = 'webp',
  sizes,
  priority = false,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || loading === 'eager') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, loading]);

  // Generate optimized image URL with ImageKit
  const getOptimizedSrc = () => {
    if (!isInView) return placeholder;
    
    // Use ImageKit with 100% quality
    return getOptimizedImageUrl(src, width, height) || src;
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div
      ref={imgRef}
      className={cn(
        'relative overflow-hidden',
        className
      )}
      style={{ width, height }}
    >
      {/* Placeholder */}
      {!isLoaded && (
        <div
          className="absolute inset-0 bg-gray-100 animate-pulse"
          style={{
            backgroundImage: `url(${placeholder})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}
      
      {/* Main Image */}
      {isInView && (
        <img
          src={hasError && fallback ? fallback : getOptimizedSrc()}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          sizes={sizes}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            'w-full h-full object-cover'
          )}
          style={{
            position: isLoaded ? 'relative' : 'absolute',
            top: 0,
            left: 0,
          }}
        />
      )}
      
      {/* Loading indicator */}
      {!isLoaded && isInView && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

// Hook for preloading images
export const useImagePreload = (srcs: string[]) => {
  useEffect(() => {
    srcs.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, [srcs]);
};

// Component for responsive images
export const ResponsiveImage: React.FC<OptimizedImageProps & {
  breakpoints?: { [key: string]: string };
}> = ({ breakpoints, ...props }) => {
  const [currentSrc, setCurrentSrc] = useState(props.src);

  useEffect(() => {
    const updateSrc = () => {
      const width = window.innerWidth;
      
      if (breakpoints) {
        const sortedBreakpoints = Object.entries(breakpoints)
          .sort(([a], [b]) => parseInt(b) - parseInt(a));
        
        for (const [breakpoint, src] of sortedBreakpoints) {
          if (width >= parseInt(breakpoint)) {
            setCurrentSrc(src);
            return;
          }
        }
      }
    };

    updateSrc();
    window.addEventListener('resize', updateSrc);
    return () => window.removeEventListener('resize', updateSrc);
  }, [breakpoints]);

  return <OptimizedImage {...props} src={currentSrc} />;
};