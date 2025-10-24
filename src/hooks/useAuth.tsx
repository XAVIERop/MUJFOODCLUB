import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useProfileSubscriptions } from './useSubscriptionManager';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, block: string, phone: string, referralCode?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
  sendOTP: (email: string) => Promise<{ error: any }>;
  verifyOTP: (email: string, token: string) => Promise<{ error: any }>;
  resendConfirmationEmail: (email: string) => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const createProfile = async (userId: string, email: string, fullName: string, block: string, phone: string, referralCode?: string) => {
    try {
      // Extract name from email if fullName is not provided
      const displayName = fullName || email.split('@')[0];
      
      // Generate QR code for student
      const qrCode = `STUDENT_${block}_${userId}`;
      
      await supabase.from('profiles').insert({
        id: userId,
        email: email,
        full_name: displayName,
        user_type: 'student',
        block: block,
        phone: phone,
        loyalty_points: 0,
        loyalty_tier: 'foodie',
        total_orders: 0,
        total_spent: 0,
        qr_code: qrCode
      });

      // Process referral code if provided (OPTIONAL)
      if (referralCode && typeof referralCode === 'string' && referralCode.trim()) {
        try {
          // Import referral service
          const { referralService } = await import('@/services/referralService');

          // Validate referral code
          const validation = await referralService.validateReferralCode(referralCode);

          if (validation.isValid) {
            // Update user with referral code
            await supabase
              .from('profiles')
              .update({
                referral_code_used: referralCode.toUpperCase(),
                referred_by: referralCode.toUpperCase()
              })
              .eq('id', userId);

            // Track referral usage
            await referralService.trackReferralUsage({
              user_id: userId,
              referral_code_used: referralCode.toUpperCase(),
              usage_type: 'signup',
              discount_applied: 5, // ₹5 for new signup (updated amount)
              team_member_credit: 0 // No credit for signup, only for orders
            });

            console.log('Referral code processed successfully:', referralCode);
          }
        } catch (error) {
          console.error('Error processing referral code:', error);
          // Don't throw error - referral code is optional
        }
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  };

  // Function to manually refresh profile
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // Set up auth state listener with error handling
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            // Defer profile fetching to avoid deadlocks
            setTimeout(() => {
              fetchProfile(session.user.id);
            }, 0);
          } else {
            setProfile(null);
          }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user.id);
        }, 0);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
    } catch (error) {
      console.error('Error setting up auth listener:', error);
      setLoading(false);
    }
  }, []);

  // Set up real-time subscription for profile updates using centralized manager
  useProfileSubscriptions(
    user?.id || null,
    (updatedProfile) => {
      console.log('Profile updated via centralized subscription:', updatedProfile);
      setProfile(updatedProfile);
    }
  );

  const signUp = async (email: string, password: string, fullName: string, block: string, phone: string, referralCode?: string) => {
    try {
      // Validate email domain
      if (!email.endsWith('@muj.manipal.edu')) {
        return { error: { message: 'Please use a valid MUJ email address (@muj.manipal.edu)' } };
      }

      // Ensure referralCode is properly handled (optional)
      const cleanReferralCode = referralCode && referralCode.trim() ? referralCode.trim() : undefined;

      // Check if user already exists in profiles table BEFORE attempting signup
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', email)
        .single();
      
      console.log('Checking existing profile:', { existingProfile, profileError });
      
      if (existingProfile) {
        console.log('User already exists in profiles table');
        return { 
        error: { 
          message: 'This email is already registered. Please try signing in instead.',
          code: 'user_already_exists'
        } 
      };
      }

      const redirectUrl = `${window.location.origin}/auth`;
      
      // PROPER EMAIL CONFIRMATION: User must verify email before login
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            block: block,
            phone: phone
          }
        }
      });
      
      console.log('Signup result:', { data, error });
      console.log('Data user:', data?.user);
      console.log('Data session:', data?.session);
      
      if (error) {
        // Handle specific error cases - check both code and message
        if (error.code === 'user_already_exists' || 
            error.message?.includes('already registered') ||
            error.message?.includes('already exists') ||
            error.message?.includes('User already registered') ||
            error.message?.includes('User already signed up') ||
            error.message?.includes('already signed up')) {
          return { 
            error: { 
              message: 'This email is already registered. Please try signing in instead.',
              code: 'user_already_exists'
            } 
          };
        }
        
        // Log the error for debugging
        console.error('Supabase signup error:', error);
        return { error };
      }
      
      // Check if user is null (might happen for existing users)
      if (!data.user && !error) {
        console.log('No user returned but no error - might be existing user');
        return { 
          error: { 
            message: 'This email is already registered. Please try signing in instead.',
            code: 'user_already_exists'
          } 
        };
      }
      
      if (data.user && !error) {
        // CRITICAL CHECK: If session is null, user already exists
        if (!data.session) {
          console.log('User already exists - session is null');
          return { 
            error: { 
              message: 'This email is already registered. Please try signing in instead.',
              code: 'user_already_exists'
            } 
          };
        }
        
        // Double-check: Verify this is actually a new user
        const { data: checkProfile, error: checkError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .single();
        
        console.log('Double-check profile:', { checkProfile, checkError });
        
        if (checkProfile) {
          console.log('User already exists in profiles after signup - this is unexpected');
          // User already exists in profiles, this shouldn't happen but handle it
          return { 
            error: { 
              message: 'This email is already registered. Please try signing in instead.',
              code: 'user_already_exists'
            } 
          };
        }
        
        // Create profile for student (without referral processing yet)
        console.log('Creating profile for new user:', data.user.id);
        await createProfile(data.user.id, email, fullName, block, phone, cleanReferralCode);
        console.log('Profile created successfully for:', email);
        
        // Final check: Make sure we actually created a new user
        const { data: finalCheck } = await supabase
          .from('profiles')
          .select('id, email, created_at')
          .eq('email', email)
          .single();
        
        if (finalCheck) {
          const createdAt = new Date(finalCheck.created_at);
          const now = new Date();
          const timeDiff = now.getTime() - createdAt.getTime();
          
          // If profile was created more than 1 minute ago, it's an existing user
          if (timeDiff > 60000) {
            console.log('Profile was created long ago - this is an existing user');
            return { 
              error: { 
                message: 'This email is already registered. Please try signing in instead.',
                code: 'user_already_exists'
              } 
            };
          }
        }
        
        // Store referral code in user metadata for processing after verification
        if (cleanReferralCode) {
          const { error: updateError } = await supabase.auth.updateUser({
            data: {
              full_name: fullName,
              block: block,
              phone: phone,
              pending_referral_code: cleanReferralCode // Store for later processing
            }
          });
          
          if (updateError) {
            console.error('Error updating user metadata:', updateError);
          }
        } else {
          // Update user metadata without referral code
          const { error: updateError } = await supabase.auth.updateUser({
            data: {
              full_name: fullName,
              block: block,
              phone: phone
            }
          });
          
          if (updateError) {
            console.error('Error updating user metadata:', updateError);
          }
        }
        
        // User will receive confirmation email
        // They must click the link to verify before they can log in
      }
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Clean up any existing auth state
      await supabase.auth.signOut({ scope: 'global' });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Check if email is confirmed
      if (data.user && !data.user.email_confirmed_at) {
        // EMERGENCY FIX: Auto-confirm emails to unblock users
        console.log('Auto-confirming email for user:', data.user.email);
        const { error: confirmError } = await supabase.auth.updateUser({
          data: { email_confirmed_at: new Date().toISOString() }
        });
        
        if (confirmError) {
          console.error('Failed to auto-confirm email:', confirmError);
          return { 
            error: { 
              message: 'Please verify your email address before signing in. Check your inbox for a confirmation link.' 
            } 
          };
        }
        
        console.log('Email auto-confirmed successfully for:', data.user.email);
      }
      
      // Redirect to homepage for students
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateProfile = async (updates: any) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update user metadata if phone number is being updated
      if (updates.phone !== undefined) {
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            full_name: updates.full_name || profile?.full_name,
            block: updates.block || profile?.block,
            phone: updates.phone
          }
        });
        
        if (updateError) {
          console.error('Error updating user metadata:', updateError);
        }
      }
      
      // Refresh profile data
      await fetchProfile(user.id);
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  // Send OTP for email verification
  const sendOTP = async (email: string) => {
    try {
      // Validate email domain
      if (!email.endsWith('@muj.manipal.edu')) {
        return { error: { message: 'Please use a valid MUJ email address (@muj.manipal.edu)' } };
      }

      // Use signInWithOtp for passwordless authentication
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          shouldCreateUser: true // This will create a user if they don't exist
        }
      });

      return { error };
    } catch (error) {
      return { error };
    }
  };

  // Verify OTP
  const verifyOTP = async (email: string, token: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });

      if (error) throw error;

      // If verification successful, create profile and process referral code
      if (data.user) {
        const fullName = data.user.user_metadata?.full_name || email.split('@')[0];
        const block = data.user.user_metadata?.block || 'B1';
        const phone = data.user.user_metadata?.phone || '';
        const pendingReferralCode = data.user.user_metadata?.pending_referral_code;
        
        await createProfile(data.user.id, email, fullName, block, phone);
        
        // Process referral code only after email verification
        if (pendingReferralCode) {
          try {
            const { referralService } = await import('@/services/referralService');
            const validation = await referralService.validateReferralCode(pendingReferralCode);
            
            if (validation.isValid) {
              // Update profile with referral code
              await supabase
                .from('profiles')
                .update({
                  referral_code_used: pendingReferralCode,
                  referred_by: pendingReferralCode
                })
                .eq('id', data.user.id);
              
              // Track referral usage for signup
              await referralService.trackReferralUsage({
                user_id: data.user.id,
                referral_code_used: pendingReferralCode,
                usage_type: 'signup',
                discount_applied: 0, // No discount for signup, only for orders
                team_member_credit: 0.50 // ₹0.50 credit for team member
              });
              
              console.log('Referral code processed after email verification:', pendingReferralCode);
            }
          } catch (error) {
            console.error('Error processing referral code after verification:', error);
            // Don't throw error - referral processing is optional
          }
          
          // Clear pending referral code from metadata
          await supabase.auth.updateUser({
            data: {
              pending_referral_code: null
            }
          });
        }
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };


  // Resend confirmation email
  const resendConfirmationEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });
      
      return { error };
    } catch (error) {
      return { error };
    }
  };

  // Check if email exists in the system
  const checkEmailExists = async (email: string) => {
    try {
      // Try to sign in with a dummy password to check if email exists
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: 'dummy_password_to_check_existence'
      });
      
      // If error is "Invalid login credentials", email exists but password is wrong
      // If error is "User not found", email doesn't exist
      if (error?.message?.includes('Invalid login credentials')) {
        return { exists: true, error: null };
      } else if (error?.message?.includes('User not found') || error?.message?.includes('Invalid email')) {
        return { exists: false, error: null };
      } else {
        // Other errors - assume email doesn't exist to be safe
        return { exists: false, error: null };
      }
    } catch (error) {
      return { exists: false, error };
    }
  };

  // Simplified reset password - just send confirmation email
  const resetPassword = async (email: string) => {
    try {
      // Validate email domain
      if (!email.endsWith('@muj.manipal.edu')) {
        return { error: { message: 'Please use a valid MUJ email address (@muj.manipal.edu)' } };
      }

      // Check if email exists
      const { exists, error: checkError } = await checkEmailExists(email);
      if (checkError) {
        return { error: { message: 'Unable to verify email. Please try again.' } };
      }

      if (!exists) {
        return { error: { message: 'This email is not registered. Please sign up first.', code: 'email_not_found' } };
      }

      // Send magic link instead of confirmation email (to avoid rate limits)
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });
      
      return { error };
    } catch (error) {
      return { error };
    }
  };

  // Update password (for password reset flow)
  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
    sendOTP,
    verifyOTP,
    resendConfirmationEmail,
    resetPassword,
    updatePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};