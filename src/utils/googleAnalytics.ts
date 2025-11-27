// Google Analytics utility functions
// Measurement ID: G-RN7PXM0S6G

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

/**
 * Track a page view
 */
export const trackPageView = (path: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-RN7PXM0S6G', {
      page_path: path,
      page_title: title,
    });
  }
};

/**
 * Track an event
 */
export const trackEvent = (
  eventName: string,
  eventParams?: {
    [key: string]: any;
  }
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};

/**
 * Track user signup
 */
export const trackSignup = (method: 'email' | 'google') => {
  trackEvent('sign_up', {
    method,
  });
};

/**
 * Track user login
 */
export const trackLogin = (method: 'email' | 'google') => {
  trackEvent('login', {
    method,
  });
};

/**
 * Track order placement
 */
export const trackOrder = (orderId: string, value: number, currency: string = 'INR') => {
  trackEvent('purchase', {
    transaction_id: orderId,
    value,
    currency,
  });
};

/**
 * Track add to cart
 */
export const trackAddToCart = (itemName: string, itemId: string, price: number, quantity: number = 1) => {
  trackEvent('add_to_cart', {
    currency: 'INR',
    value: price * quantity,
    items: [
      {
        item_id: itemId,
        item_name: itemName,
        price,
        quantity,
      },
    ],
  });
};

/**
 * Track checkout start
 */
export const trackBeginCheckout = (value: number) => {
  trackEvent('begin_checkout', {
    currency: 'INR',
    value,
  });
};

/**
 * Track cafe view
 */
export const trackCafeView = (cafeName: string, cafeId: string) => {
  trackEvent('view_item', {
    item_id: cafeId,
    item_name: cafeName,
    item_category: 'cafe',
  });
};

/**
 * Track menu item view
 */
export const trackMenuItemView = (itemName: string, itemId: string, category: string, price: number) => {
  trackEvent('view_item', {
    item_id: itemId,
    item_name: itemName,
    item_category: category,
    price,
    currency: 'INR',
  });
};

/**
 * Track search
 */
export const trackSearch = (searchTerm: string) => {
  trackEvent('search', {
    search_term: searchTerm,
  });
};

/**
 * Track share
 */
export const trackShare = (method: string, contentType: string, itemId?: string) => {
  trackEvent('share', {
    method,
    content_type: contentType,
    item_id: itemId,
  });
};

/**
 * Set user properties
 */
export const setUserProperties = (userId: string, properties?: { [key: string]: any }) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('set', 'user_id', userId);
    if (properties) {
      Object.entries(properties).forEach(([key, value]) => {
        window.gtag('set', { [key]: value });
      });
    }
  }
};

