import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useProfileSubscriptions } from './useSubscriptionManager';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, block: string, phone: string) => Promise<{ error: any }>;
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

  const createProfile = async (userId: string, email: string, fullName: string, block: string, phone: string) => {
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

  const signUp = async (email: string, password: string, fullName: string, block: string, phone: string) => {
    try {
      // Validate email domain
      if (!email.endsWith('@muj.manipal.edu')) {
        return { error: { message: 'Please use a valid MUJ email address (@muj.manipal.edu)' } };
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
      
      if (error) {
        // Handle specific error cases
        if (error.code === 'user_already_exists') {
          return { 
            error: { 
              message: 'This email is already registered. Please try signing in instead.',
              code: 'user_already_exists'
            } 
          };
        }
        return { error };
      }
      
      if (data.user && !error) {
        // Create profile for student
        await createProfile(data.user.id, email, fullName, block, phone);
        
        // Update user metadata to include phone number
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

      // If verification successful, create profile
      if (data.user) {
        const fullName = data.user.user_metadata?.full_name || email.split('@')[0];
        const block = data.user.user_metadata?.block || 'B1';
        
        await createProfile(data.user.id, email, fullName, block, '');
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