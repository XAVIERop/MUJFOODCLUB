import { supabase } from '@/integrations/supabase/client';

export interface ReferralCode {
  id: string;
  code: string;
  team_member_name: string;
  is_active: boolean;
  created_at: string;
}

export interface ReferralValidation {
  isValid: boolean;
  teamMemberName?: string;
  error?: string;
}

export interface ReferralUsage {
  user_id: string;
  referral_code_used: string;
  usage_type: 'signup' | 'checkout';
  order_id?: string;
  discount_applied: number;
  team_member_credit: number;
}

class ReferralService {
  /**
   * Validate a referral code
   */
  async validateReferralCode(code: string): Promise<ReferralValidation> {
    try {
      if (!code || code.trim().length === 0) {
        return { isValid: false, error: 'Referral code is required' };
      }

      const { data, error } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return { isValid: false, error: 'Invalid referral code' };
      }

      return {
        isValid: true,
        teamMemberName: data.team_member_name
      };
    } catch (error) {
      console.error('Error validating referral code:', error);
      return { isValid: false, error: 'Failed to validate referral code' };
    }
  }

  /**
   * Check if user can use referral codes (max 10 times)
   */
  async checkUserReferralLimit(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('referral_usage_count')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return true; // Allow if can't check
      }

      return (data.referral_usage_count || 0) < 10;
    } catch (error) {
      console.error('Error checking user referral limit:', error);
      return true; // Allow if can't check
    }
  }

  /**
   * Track referral code usage
   */
  async trackReferralUsage(usage: ReferralUsage): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('referral_usage_tracking')
        .insert([usage]);

      if (error) {
        console.error('Error tracking referral usage:', error);
        return false;
      }

      // Update user's referral usage count
      await this.updateUserReferralCount(usage.user_id);
      
      // Update team member performance
      await this.updateTeamMemberPerformance(usage.referral_code_used, usage.team_member_credit);

      return true;
    } catch (error) {
      console.error('Error tracking referral usage:', error);
      return false;
    }
  }

  /**
   * Update user's referral usage count
   */
  private async updateUserReferralCount(userId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('increment_referral_usage', {
        user_id: userId
      });

      if (error) {
        // Fallback: manual update
        const { data: user } = await supabase
          .from('users')
          .select('referral_usage_count')
          .eq('id', userId)
          .single();

        if (user) {
          await supabase
            .from('users')
            .update({ 
              referral_usage_count: (user.referral_usage_count || 0) + 1 
            })
            .eq('id', userId);
        }
      }
    } catch (error) {
      console.error('Error updating user referral count:', error);
    }
  }

  /**
   * Update team member performance
   */
  private async updateTeamMemberPerformance(code: string, credit: number): Promise<void> {
    try {
      // Get team member info
      const { data: referralCode } = await supabase
        .from('referral_codes')
        .select('team_member_name')
        .eq('code', code)
        .single();

      if (!referralCode) return;

      // Check if performance record exists
      const { data: existing } = await supabase
        .from('team_member_performance')
        .select('*')
        .eq('team_member_code', code)
        .single();

      if (existing) {
        // Update existing record
        await supabase
          .from('team_member_performance')
          .update({
            orders_brought: existing.orders_brought + 1,
            total_earnings: existing.total_earnings + credit,
            last_updated: new Date().toISOString()
          })
          .eq('team_member_code', code);
      } else {
        // Create new record
        await supabase
          .from('team_member_performance')
          .insert([{
            team_member_code: code,
            team_member_name: referralCode.team_member_name,
            orders_brought: 1,
            total_earnings: credit
          }]);
      }
    } catch (error) {
      console.error('Error updating team member performance:', error);
    }
  }

  /**
   * Get team member analytics (for admin dashboard)
   */
  async getTeamMemberAnalytics(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('team_member_performance')
        .select('*')
        .order('total_earnings', { ascending: false });

      if (error) {
        console.error('Error fetching team analytics:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching team analytics:', error);
      return [];
    }
  }

  /**
   * Calculate team member reward based on order count
   */
  calculateTeamMemberReward(orderCount: number): number {
    if (orderCount <= 50) return 0.50;
    if (orderCount <= 100) return 0.75;
    return 1.00;
  }

  /**
   * Apply referral discount to order
   */
  applyReferralDiscount(subtotal: number, referralCode: string): {
    discountAmount: number;
    finalAmount: number;
  } {
    const discountAmount = 5; // ₹5 off
    const finalAmount = Math.max(0, subtotal - discountAmount);
    
    return {
      discountAmount,
      finalAmount
    };
  }
}

export const referralService = new ReferralService();
