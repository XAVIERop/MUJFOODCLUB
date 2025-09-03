import { useEffect, useCallback } from 'react';

interface UseScrollToTopOptions {
  behavior?: ScrollBehavior;
  smooth?: boolean;
}

export const useScrollToTop = (options: UseScrollToTopOptions = {}) => {
  const { behavior = 'smooth', smooth = true } = options;

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: smooth ? behavior : 'auto'
    });
  }, [behavior, smooth]);

  const scrollToTopOnMount = useCallback(() => {
    // Small delay to ensure component is fully rendered
    setTimeout(() => {
      scrollToTop();
    }, 100);
  }, [scrollToTop]);

  const scrollToTopOnTabChange = useCallback((tabValue: string) => {
    // Scroll to top when tab changes
    scrollToTop();
  }, [scrollToTop]);

  // Auto-scroll to top on component mount
  useEffect(() => {
    scrollToTopOnMount();
  }, [scrollToTopOnMount]);

  return {
    scrollToTop,
    scrollToTopOnMount,
    scrollToTopOnTabChange
  };
};
