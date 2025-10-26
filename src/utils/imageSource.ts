// ImageKit.io integration with 100% quality preservation
// Provides CDN benefits while maintaining original image quality

const useImageKit = import.meta.env.VITE_USE_IMAGEKIT === 'true';
const imageKitEndpoint = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT as string | undefined;

interface ImageKitOptions {
  width?: number;
  height?: number;
  quality?: number; // 1-100, default 100 (no compression)
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  crop?: 'maintain_ratio' | 'force' | 'at_max';
  focus?: 'auto' | 'face' | 'center';
}

/**
 * Get ImageKit URL with 100% quality preservation
 * - Uses CDN for faster delivery
 * - Maintains original quality (quality=100)
 * - Auto-optimizes format (WebP for supported browsers)
 * - Provides responsive images
 */
export function getImageUrl(
  publicPath?: string | null, 
  options: ImageKitOptions = {}
): string | undefined {
  if (!publicPath) return undefined;
  
  const normalizedPath = publicPath.startsWith('/') ? publicPath : `/${publicPath}`;
  
  // Fallback to local if ImageKit not configured
  if (!useImageKit || !imageKitEndpoint) {
    return normalizedPath;
  }
  
  // Build ImageKit URL with transformations
  // Properly encode the path to handle spaces and special characters
  const encodedPath = normalizedPath.split('/').map(segment => encodeURIComponent(segment)).join('/');
  const url = new URL(`${imageKitEndpoint}${encodedPath}`);
  
  // Add transformations as query parameters
  const transformations: string[] = [];
  
  // Quality: 100% (no compression) by default
  if (options.quality !== undefined) {
    transformations.push(`q-${options.quality}`);
  } else {
    transformations.push('q-100'); // 100% quality
  }
  
  // Format: Auto-optimize (WebP for supported browsers)
  if (options.format) {
    transformations.push(`f-${options.format}`);
  } else {
    transformations.push('f-auto');
  }
  
  // Dimensions
  if (options.width) {
    transformations.push(`w-${options.width}`);
  }
  if (options.height) {
    transformations.push(`h-${options.height}`);
  }
  
  // Crop mode
  if (options.crop) {
    transformations.push(`c-${options.crop}`);
  }
  
  // Focus point
  if (options.focus) {
    transformations.push(`fo-${options.focus}`);
  }
  
  // Add transformations to URL
  if (transformations.length > 0) {
    url.searchParams.set('tr', transformations.join(','));
  }
  
  return url.toString();
}

/**
 * Get responsive image URLs for different screen sizes
 * Maintains 100% quality while providing optimal sizes
 */
export function getResponsiveImageUrl(
  publicPath?: string | null,
  baseOptions: ImageKitOptions = {}
) {
  if (!publicPath) return undefined;
  
  return {
    // Mobile (320px)
    mobile: getImageUrl(publicPath, { ...baseOptions, width: 320, quality: 100 }),
    // Tablet (768px) 
    tablet: getImageUrl(publicPath, { ...baseOptions, width: 768, quality: 100 }),
    // Desktop (1200px)
    desktop: getImageUrl(publicPath, { ...baseOptions, width: 1200, quality: 100 }),
    // Original (no size limit)
    original: getImageUrl(publicPath, { ...baseOptions, quality: 100 })
  };
}

/**
 * Get optimized image URL with smart defaults
 * - 100% quality preservation
 * - Auto WebP format
 * - Smart cropping
 */
export function getOptimizedImageUrl(
  publicPath?: string | null,
  width?: number,
  height?: number
): string | undefined {
  return getImageUrl(publicPath, {
    width,
    height,
    quality: 100, // 100% quality
    format: 'auto', // Auto WebP
    crop: 'maintain_ratio',
    focus: 'auto'
  });
}


