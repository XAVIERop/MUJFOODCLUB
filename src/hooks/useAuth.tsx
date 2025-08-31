import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, block: string, cafeName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
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

  const createProfile = async (userId: string, email: string, fullName: string, block: string, cafeName?: string) => {
    try {
      const userType = email.endsWith('@mujfoodclub.in') ? 'cafe_owner' : 'student';
      
      if (userType === 'cafe_owner' && cafeName) {
        // For cafe owners, find the cafe and create profile
        const { data: cafe } = await supabase
          .from('cafes')
          .select('id')
          .eq('name', cafeName)
          .single();
        
        if (cafe) {
          await supabase.from('profiles').insert({
            id: userId,
            email: email,
            full_name: fullName,
            user_type: userType,
            cafe_id: cafe.id,
            loyalty_points: 0,
            loyalty_tier: 'foodie',
            total_orders: 0,
            total_spent: 0,
            qr_code: `CAFE_${cafe.id}_${userId}`
          });
        }
      } else {
        // For students, create regular profile
        await supabase.from('profiles').insert({
          id: userId,
          email: email,
          full_name: fullName,
          user_type: userType,
          block: block,
          loyalty_points: 0,
          loyalty_tier: 'foodie',
          total_orders: 0,
          total_spent: 0,
          qr_code: `STUDENT_${block}_${userId}`
        });
      }
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  // Function to manually refresh profile
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // Set up auth state listener
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
  }, []);

  const signUp = async (email: string, password: string, fullName: string, block: string, cafeName?: string) => {
    try {
      // Validate email domain
      if (!email.endsWith('@muj.manipal.edu') && !email.endsWith('@mujfoodclub.in')) {
        return { error: { message: 'Please use a valid MUJ email (@muj.manipal.edu) or FoodClub email (@mujfoodclub.in)' } };
      }

      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            block: block,
            cafe_name: cafeName
          }
        }
      });
      
      if (data.user && !error) {
        // Create profile based on user type
        await createProfile(data.user.id, email, fullName, block, cafeName);
      }
      
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Clean up any existing auth state
      await supabase.auth.signOut({ scope: 'global' });
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Determine user type and route accordingly
      const userType = email.endsWith('@mujfoodclub.in') ? 'cafe_owner' : 'student';
      
      // Force page reload for clean state
      setTimeout(() => {
        if (userType === 'cafe_owner') {
          window.location.href = '/cafe-dashboard';
        } else {
          window.location.href = '/';
        }
      }, 100);
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
      setUser(null);
      setSession(null);
      setProfile(null);
      window.location.href = '/auth';
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
      
      // Refresh profile
      await fetchProfile(user.id);
      
      return { error: null };
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
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};