import { supabase } from '@/integrations/supabase/client';

export interface PromotionalBannerData {
  id: string;
  cafe_id?: string;
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
  start_date?: string;
  end_date?: string;
  location_scope?: 'ghs' | 'off_campus' | 'all';
  created_at: string;
  updated_at: string;
}

class PromotionalBannerService {
  // Helper function to check if user should see banners with specific scope
  private shouldUserSeeBannerScope(userEmail: string | null, bannerScope: string): boolean {
    const MUJ_EMAIL_DOMAIN = '@muj.manipal.edu';
    const FOODCLUB_EMAIL_DOMAIN = '@mujfoodclub.in';
    
    // Banners with scope 'all' are visible to everyone
    if (bannerScope === 'all') {
      return true;
    }
    
    // If no user email (guest), only show off_campus banners
    if (!userEmail) {
      return bannerScope === 'off_campus';
    }
    
    // Users with MUJ or FoodClub email can see all banners
    if (userEmail.endsWith(MUJ_EMAIL_DOMAIN) || userEmail.endsWith(FOODCLUB_EMAIL_DOMAIN)) {
      return true;
    }
    
    // Other users can only see off_campus banners
    return bannerScope === 'off_campus';
  }

  // Get active promotional banners for a specific cafe or all cafes
  // Filtered by user's email domain for GHS/off-campus scope
  async getActiveBanners(cafeId?: string, userEmail?: string | null): Promise<PromotionalBannerData[]> {
    try {
      let query = supabase
        .from('promotional_banners')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString())
        .order('priority', { ascending: false });

      // If cafeId is provided, get banners for that cafe or global banners
      if (cafeId) {
        query = query.or(`cafe_id.eq.${cafeId},cafe_id.is.null`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching promotional banners:', error);
        return [];
      }

      // Filter banners based on user's email and banner scope
      const filteredBanners = (data || []).filter(banner => {
        const scope = banner.location_scope || 'ghs'; // Default to ghs if not set
        return this.shouldUserSeeBannerScope(userEmail || null, scope);
      });

      return filteredBanners;
    } catch (error) {
      console.error('Error fetching promotional banners:', error);
      return [];
    }
  }

  // Get all banners (for admin management)
  async getAllBanners(): Promise<PromotionalBannerData[]> {
    try {
      const { data, error } = await supabase
        .from('promotional_banners')
        .select('*')
        .order('priority', { ascending: false });

      if (error) {
        console.error('Error fetching all banners:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching all banners:', error);
      return [];
    }
  }

  // Create a new promotional banner
  async createBanner(banner: Omit<PromotionalBannerData, 'id' | 'created_at' | 'updated_at'>): Promise<PromotionalBannerData | null> {
    try {
      const { data, error } = await supabase
        .from('promotional_banners')
        .insert([banner])
        .select()
        .single();

      if (error) {
        console.error('Error creating banner:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating banner:', error);
      return null;
    }
  }

  // Update a promotional banner
  async updateBanner(id: string, updates: Partial<PromotionalBannerData>): Promise<PromotionalBannerData | null> {
    try {
      const { data, error } = await supabase
        .from('promotional_banners')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating banner:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating banner:', error);
      return null;
    }
  }

  // Delete a promotional banner
  async deleteBanner(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('promotional_banners')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting banner:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting banner:', error);
      return false;
    }
  }

  // Get default banners (for demo purposes)
  getDefaultBanners(): PromotionalBannerData[] {
    return [
      {
        id: 'default-1',
        title: '30% Off Fitness Meal',
        subtitle: 'Healthy & Delicious',
        description: 'Get 30% off on all fitness meals. Perfect for your health goals!',
        discount: '30% OFF',
        image_url: '/promo-fitness.jpg',
        button_text: 'Order Now',
        button_action: 'scroll_to_menu',
        background_color: 'bg-gradient-to-r from-green-500 to-emerald-600',
        text_color: 'text-white',
        is_active: true,
        priority: 100,
        cafe_id: null,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'default-2',
        title: 'Weekend Special',
        subtitle: 'Limited Time Offer',
        description: 'Enjoy our weekend specials with amazing discounts on your favorite dishes.',
        discount: '25% OFF',
        image_url: '/promo-weekend.jpg',
        button_text: 'Explore Menu',
        button_action: 'scroll_to_menu',
        background_color: 'bg-gradient-to-r from-orange-500 to-red-500',
        text_color: 'text-white',
        is_active: true,
        priority: 90,
        cafe_id: null,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'default-3',
        title: 'New Menu Items',
        subtitle: 'Fresh & Tasty',
        description: 'Check out our latest additions to the menu. Something new every week!',
        discount: 'NEW',
        image_url: '/promo-new.jpg',
        button_text: 'View New Items',
        button_action: 'scroll_to_menu',
        background_color: 'bg-gradient-to-r from-purple-500 to-pink-500',
        text_color: 'text-white',
        is_active: true,
        priority: 80,
        cafe_id: null,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ];
  }
}

export const promotionalBannerService = new PromotionalBannerService();
