import React from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  priority = false
}) => {
  // Convert original image path to WebP
  const getWebPSrc = (originalSrc: string) => {
    const extension = originalSrc.split('.').pop()?.toLowerCase();
    if (extension && ['jpg', 'jpeg', 'png'].includes(extension)) {
      return originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }
    return originalSrc;
  };

  const webpSrc = getWebPSrc(src);
  const isWebPSupported = typeof window !== 'undefined' && 
    window.HTMLPictureElement && 
    window.HTMLSourceElement;

  // If WebP is supported, use picture element with fallback
  if (isWebPSupported) {
    return (
      <picture>
        <source srcSet={webpSrc} type="image/webp" />
        <img
          src={src}
          alt={alt}
          className={className}
          width={width}
          height={height}
          loading={priority ? 'eager' : loading}
          decoding="async"
        />
      </picture>
    );
  }

  // Fallback for browsers without WebP support
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={priority ? 'eager' : loading}
      decoding="async"
    />
  );
};

export default OptimizedImage;