import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, User, Mail, MapPin, Trophy, Receipt, Edit, Save, X, RotateCcw, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NotificationPreferences from '@/components/NotificationPreferences';

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    block: '',
    phone: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        block: profile.block || '',
        phone: profile.phone || ''
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user || !profile) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          block: formData.block,
          phone: formData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || '',
      block: profile?.block || '',
      phone: profile?.phone || ''
    });
    setIsEditing(false);
  };

  const handleResetTestAccount = async () => {
    console.log('🔄 Reset Test Account clicked');
    console.log('🔍 User:', user);
    console.log('🔍 Profile:', profile);
    
    if (!user || !profile) {
      console.log('❌ Missing user or profile');
      return;
    }

    // Safety check: Only allow reset for test account
    if (profile.email !== 'test@muj.manipal.edu') {
      toast({
        title: "Access Denied",
        description: "This feature is only available for test accounts.",
        variant: "destructive"
      });
      return;
    }
    
    console.log('✅ Test account confirmed, proceeding with reset...');

    // Confirmation dialog
    const confirmed = window.confirm(
      '⚠️ WARNING: This will reset ALL data for your test account!\n\n' +
      'This will delete:\n' +
      '• All orders and order history\n' +
      '• Reset profile to initial state\n\n' +
      'Are you sure you want to continue?'
    );

    if (!confirmed) return;

    setResetting(true);
    try {
      console.log('🗑️ Starting reset process...');
      
      // Delete all orders for the test user
      console.log('🗑️ Deleting orders for user:', user.id);
      const { error: ordersError } = await supabase
        .from('orders')
        .delete()
        .eq('user_id', user.id);

      if (ordersError) {
        console.error('❌ Error deleting orders:', ordersError);
        throw ordersError;
      }
      console.log('✅ Orders deleted successfully');


      // Delete any order ratings (need to join with orders table)
      console.log('🗑️ Deleting order ratings for user:', user.id);
      
      // First get all order IDs for this user
      const { data: userOrders, error: ordersQueryError } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', user.id);

      if (ordersQueryError) {
        console.error('❌ Error fetching user orders for ratings deletion:', ordersQueryError);
      } else if (userOrders && userOrders.length > 0) {
        const orderIds = userOrders.map(order => order.id);
        console.log('🗑️ Found orders to delete ratings for:', orderIds);
        
        const { error: ratingsError } = await supabase
          .from('order_ratings')
          .delete()
          .in('order_id', orderIds);

        if (ratingsError) {
          console.error('❌ Error deleting order ratings:', ratingsError);
          // Don't throw here, ratings might not exist
        } else {
          console.log('✅ Order ratings deleted successfully');
        }
      } else {
        console.log('ℹ️ No orders found for user, skipping ratings deletion');
      }

      // Delete any order notifications
      console.log('🗑️ Deleting order notifications for user:', user.id);
      const { error: notificationsError } = await supabase
        .from('order_notifications')
        .delete()
        .eq('user_id', user.id);

      if (notificationsError) {
        console.error('❌ Error deleting order notifications:', notificationsError);
        // Don't throw here, notifications might not exist
      } else {
        console.log('✅ Order notifications deleted successfully');
      }

      // Delete any cafe staff records
      console.log('🗑️ Deleting cafe staff records for user:', user.id);
      const { error: cafeStaffError } = await supabase
        .from('cafe_staff')
        .delete()
        .eq('user_id', user.id);

      if (cafeStaffError) {
        console.error('❌ Error deleting cafe staff records:', cafeStaffError);
        // Don't throw here, cafe staff records might not exist
      } else {
        console.log('✅ Cafe staff records deleted successfully');
      }


      // Reset profile to initial state
      console.log('🔄 Resetting profile for user:', user.id);
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          total_orders: 0,
          total_spent: 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('❌ Error resetting profile:', profileError);
        throw profileError;
      }
      console.log('✅ Profile reset successfully');

      // Refresh profile data
      console.log('🔄 Refreshing profile data...');
      await refreshProfile();
      console.log('✅ Profile data refreshed');

      toast({
        title: "Test Account Reset Complete!",
        description: "All data has been cleared. You can now test from scratch.",
      });
      console.log('🎉 Reset completed successfully!');

    } catch (error) {
      console.error('❌ Error resetting test account:', error);
      toast({
        title: "Reset Failed",
        description: `There was an error resetting your test account: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setResetting(false);
      console.log('🔄 Reset process finished');
    }
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-background pt-16 pb-24 lg:pb-8">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
            <p className="text-muted-foreground mb-6">You need to sign in to view your profile.</p>
            <Button onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16 pb-24 lg:pb-8">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">My Profile</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <Card className="food-card">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                      <AvatarFallback className="text-2xl">
                        {profile.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-xl">{profile.full_name}</CardTitle>
                  <p className="text-muted-foreground">{profile.email}</p>
                  <Badge variant="outline" className="mt-2">
                    {profile.user_type === 'cafe_owner' ? 'Cafe Owner' : 'Student'}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>Block: {profile.block || 'Not set'}</span>
                  </div>
                  {profile.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>Phone: {profile.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Receipt className="w-4 h-4 text-muted-foreground" />
                    <span>Total Orders: {profile.total_orders || 0}</span>
                  </div>
                  
                  {/* Reset Test Account Button - Only for test account */}
                  {profile.email === 'test@muj.manipal.edu' && (
                    <div className="pt-4 border-t">
                      <Button
                        onClick={handleResetTestAccount}
                        disabled={resetting}
                        variant="destructive"
                        size="sm"
                        className="w-full"
                      >
                        {resetting ? (
                          <>
                            <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                            Resetting...
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Reset Test Account
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        This will delete all orders and reset your account to initial state
                      </p>
                      <Button
                        onClick={async () => {
                          console.log('🔄 Force refreshing profile data...');
                          await refreshProfile();
                          toast({
                            title: "Profile Refreshed",
                            description: "Profile data has been refreshed from database",
                          });
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Force Refresh Profile
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Edit Profile Form */}
            <div className="lg:col-span-2">
              <Card className="food-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Profile Information</CardTitle>
                    {!isEditing ? (
                      <Button onClick={() => setIsEditing(true)} variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button onClick={handleCancel} variant="outline" size="sm">
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={loading} size="sm">
                          <Save className="w-4 h-4 mr-2" />
                          {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        disabled={!isEditing}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="block">Block</Label>
                      <Input
                        id="block"
                        value={formData.block}
                        onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                        disabled={!isEditing}
                        placeholder="e.g., B1, B2, B3"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!isEditing}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={profile.email}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed
                      </p>
                    </div>
                  </div>

                  {!isEditing && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Click "Edit Profile" to make changes to your information.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notification Preferences */}
              <div className="mt-6">
                <NotificationPreferences />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer - Desktop only (mobile has bottom nav) */}
      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  );
};

export default Profile;
