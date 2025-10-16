import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Plus, 
  Trash2, 
  Eye,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

interface ReferralCode {
  id: string;
  code: string;
  team_member_name: string;
  is_active: boolean;
  created_at: string;
}

interface ReferralStats {
  total_codes: number;
  active_codes: number;
  total_usage: number;
  total_earnings: number;
}

interface ReferralUsage {
  referral_code_used: string;
  usage_count: number;
  total_discount: number;
  total_earnings: number;
}

const AdminReferrals = () => {
  const { user } = useAuth();
  
  // Only allow access to pulkit.229302047@muj.manipal.edu
  if (!user || user.email !== 'pulkit.229302047@muj.manipal.edu') {
    return <Navigate to="/" replace />;
  }

  const [referralCodes, setReferralCodes] = useState<ReferralCode[]>([]);
  const [referralStats, setReferralStats] = useState<ReferralStats>({
    total_codes: 0,
    active_codes: 0,
    total_usage: 0,
    total_earnings: 0
  });
  const [usageData, setUsageData] = useState<ReferralUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newTeamMember, setNewTeamMember] = useState('');
  const { toast } = useToast();

  // Fetch all referral data
  const fetchReferralData = async () => {
    try {
      setLoading(true);

      // Fetch referral codes
      const { data: codes, error: codesError } = await supabase
        .from('referral_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (codesError) throw codesError;
      setReferralCodes(codes || []);

      // Fetch usage statistics
      const { data: usage, error: usageError } = await supabase
        .from('referral_usage_tracking')
        .select('referral_code_used, discount_applied, team_member_credit');

      if (usageError) throw usageError;

      // Calculate stats
      const totalUsage = usage?.length || 0;
      const totalEarnings = usage?.reduce((sum, item) => sum + (item.team_member_credit || 0), 0) || 0;
      
      setReferralStats({
        total_codes: codes?.length || 0,
        active_codes: codes?.filter(c => c.is_active).length || 0,
        total_usage: totalUsage,
        total_earnings: totalEarnings
      });

      // Calculate usage per code
      const usageMap = new Map<string, ReferralUsage>();
      usage?.forEach(item => {
        const code = item.referral_code_used;
        if (!usageMap.has(code)) {
          usageMap.set(code, {
            referral_code_used: code,
            usage_count: 0,
            total_discount: 0,
            total_earnings: 0
          });
        }
        const existing = usageMap.get(code)!;
        existing.usage_count += 1;
        existing.total_discount += item.discount_applied || 0;
        existing.total_earnings += item.team_member_credit || 0;
      });

      setUsageData(Array.from(usageMap.values()).sort((a, b) => b.usage_count - a.usage_count));

    } catch (error) {
      console.error('Error fetching referral data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch referral data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create new referral code
  const createReferralCode = async () => {
    if (!newCode.trim() || !newTeamMember.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both code and team member name",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('referral_codes')
        .insert([{
          code: newCode.toUpperCase().trim(),
          team_member_name: newTeamMember.trim(),
          is_active: true
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Referral code ${newCode.toUpperCase()} created successfully`,
      });

      setNewCode('');
      setNewTeamMember('');
      setShowCreateForm(false);
      fetchReferralData();

    } catch (error: any) {
      console.error('Error creating referral code:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create referral code",
        variant: "destructive",
      });
    }
  };

  // Toggle referral code status
  const toggleReferralCode = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('referral_codes')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Referral code ${currentStatus ? 'deactivated' : 'activated'} successfully`,
      });

      fetchReferralData();

    } catch (error: any) {
      console.error('Error toggling referral code:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update referral code",
        variant: "destructive",
      });
    }
  };

  // Get usage data for a specific code
  const getUsageForCode = (code: string): ReferralUsage | undefined => {
    return usageData.find(item => item.referral_code_used === code);
  };

  useEffect(() => {
    fetchReferralData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-lg">Loading referral data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Referral System Admin</h1>
          <p className="text-gray-600 mt-2">Manage referral codes and track team performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Codes</p>
                  <p className="text-2xl font-bold text-gray-900">{referralStats.total_codes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Codes</p>
                  <p className="text-2xl font-bold text-gray-900">{referralStats.active_codes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Usage</p>
                  <p className="text-2xl font-bold text-gray-900">{referralStats.total_usage}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">₹{referralStats.total_earnings.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create New Code */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Manage Referral Codes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showCreateForm ? (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Referral Code
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="code">Referral Code</Label>
                    <Input
                      id="code"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                      placeholder="e.g., TEAM123"
                      maxLength={20}
                    />
                  </div>
                  <div>
                    <Label htmlFor="teamMember">Team Member Name</Label>
                    <Input
                      id="teamMember"
                      value={newTeamMember}
                      onChange={(e) => setNewTeamMember(e.target.value)}
                      placeholder="e.g., John Smith"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={createReferralCode}>Create Code</Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Referral Codes Table */}
        <Card>
          <CardHeader>
            <CardTitle>Referral Codes & Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Code</th>
                    <th className="text-left p-4">Team Member</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Usage</th>
                    <th className="text-left p-4">Discount Given</th>
                    <th className="text-left p-4">Earnings</th>
                    <th className="text-left p-4">Created</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {referralCodes.map((code) => {
                    const usage = getUsageForCode(code.code);
                    return (
                      <tr key={code.id} className="border-b">
                        <td className="p-4">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                            {code.code}
                          </code>
                        </td>
                        <td className="p-4 font-medium">{code.team_member_name}</td>
                        <td className="p-4">
                          <Badge variant={code.is_active ? "default" : "secondary"}>
                            {code.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="p-4">{usage?.usage_count || 0}</td>
                        <td className="p-4">₹{usage?.total_discount.toFixed(2) || "0.00"}</td>
                        <td className="p-4 font-medium text-green-600">
                          ₹{usage?.total_earnings.toFixed(2) || "0.00"}
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {new Date(code.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleReferralCode(code.id, code.is_active)}
                            className={code.is_active ? "text-red-600" : "text-green-600"}
                          >
                            {code.is_active ? (
                              <>
                                <Trash2 className="h-4 w-4 mr-1" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Activate
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <Button onClick={fetchReferralData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminReferrals;
