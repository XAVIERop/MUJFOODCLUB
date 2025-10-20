// Minimal, safe ImageKit helper with feature flag and public fallback

const useImageKit = import.meta.env.VITE_USE_IMAGEKIT === 'true';
const imageKitEndpoint = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT as string | undefined;

/**
 * Returns a URL for the given public path.
 * - If VITE_USE_IMAGEKIT=true and endpoint set, returns ImageKit URL
 * - Otherwise returns the original public path
 */
export function getImageUrl(publicPath?: string | null): string | undefined {
  if (!publicPath) return undefined;
  const normalizedPath = publicPath.startsWith('/') ? publicPath : `/${publicPath}`;
  if (useImageKit && imageKitEndpoint) {
    // Do not force quality; allow IK defaults. Keep exact path.
    return `${imageKitEndpoint}${normalizedPath}`;
  }
  return normalizedPath;
}


