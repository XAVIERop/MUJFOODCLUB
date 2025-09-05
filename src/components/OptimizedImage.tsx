import { useState, useRef, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  placeholder = 'blur',
  blurDataURL
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Generate blur placeholder if not provided
  const defaultBlurDataURL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+';

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <Skeleton 
          className={`absolute inset-0 ${width ? `w-[${width}px]` : 'w-full'} ${height ? `h-[${height}px]` : 'h-full'}`} 
        />
      )}
      
      {isInView && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          } ${className}`}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          style={{
            contentVisibility: 'auto',
            containIntrinsicSize: width && height ? `${width}px ${height}px` : undefined
          }}
        />
      )}
      
      {hasError && (
        <div className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}>
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

// Hook for preloading images
export const useImagePreload = (srcs: string[]) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const preloadPromises = srcs.map(src => {
      return new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = () => reject(src);
        img.src = src;
      });
    });

    Promise.allSettled(preloadPromises).then(results => {
      const loaded = new Set<string>();
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          loaded.add(srcs[index]);
        }
      });
      setLoadedImages(loaded);
    });
  }, [srcs]);

  return loadedImages;
};

// Component for responsive images with multiple sizes
interface ResponsiveImageProps extends OptimizedImageProps {
  sizes?: string;
  srcSet?: string;
}

export const ResponsiveImage = ({
  src,
  srcSet,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  ...props
}: ResponsiveImageProps) => {
  return (
    <OptimizedImage
      {...props}
      src={src}
      style={{
        ...props.style,
        width: '100%',
        height: 'auto'
      }}
    />
  );
};
