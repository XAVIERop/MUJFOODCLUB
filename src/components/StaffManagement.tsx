import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useCafeStaff, CafeStaff } from '@/hooks/useCafeStaff';
import { Plus, Edit, Trash2, User, Phone, Mail } from 'lucide-react';

interface StaffManagementProps {
  cafeId: string;
}

const StaffManagement: React.FC<StaffManagementProps> = ({ cafeId }) => {
  const { toast } = useToast();
  const { staff, loading, error, addStaff, updateStaff, removeStaff, getStaffDisplayName } = useCafeStaff(cafeId);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    staff_name: '',
    role: 'staff'
  });

  const handleAddStaff = async () => {
    if (!formData.staff_name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a staff name",
        variant: "destructive"
      });
      return;
    }

    try {
      await addStaff({
        staff_name: formData.staff_name.trim(),
        role: formData.role
      });
      setFormData({ staff_name: '', role: 'staff' });
      setIsAdding(false);
      toast({
        title: "Success",
        description: "Staff member added successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add staff member",
        variant: "destructive"
      });
    }
  };

  const handleUpdateStaff = async (staffId: string, role: string) => {
    try {
      await updateStaff(staffId, { role });
      setEditingId(null);
      toast({
        title: "Success",
        description: "Staff member updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update staff member",
        variant: "destructive"
      });
    }
  };

  const handleRemoveStaff = async (staffId: string, staff: CafeStaff) => {
    const staffName = getStaffDisplayName(staff);
    if (!confirm(`Are you sure you want to remove ${staffName} from staff?`)) {
      return;
    }

    try {
      await removeStaff(staffId);
      toast({
        title: "Success",
        description: "Staff member removed successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove staff member",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Staff Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading staff...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Staff Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Staff Management</CardTitle>
          <Button onClick={() => setIsAdding(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Staff
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Staff Form */}
        {isAdding && (
          <div className="border rounded-lg p-4 space-y-4">
            <h4 className="font-medium">Add New Staff Member</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="staff_name">Staff Name</Label>
                <Input
                  id="staff_name"
                  placeholder="Enter staff name (e.g., John, Mike, Sarah)"
                  value={formData.staff_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, staff_name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delivery">Delivery Guy</SelectItem>
                    <SelectItem value="cashier">Cashier</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="staff">General Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddStaff} size="sm">Add Staff</Button>
              <Button onClick={() => setIsAdding(false)} variant="outline" size="sm">Cancel</Button>
            </div>
          </div>
        )}

        {/* Staff List */}
        <div className="space-y-2">
          {staff.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No staff members found</p>
          ) : (
            staff.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{getStaffDisplayName(member)}</p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      {member.staff_name ? (
                        <span>Staff Member</span>
                      ) : (
                        <>
                          <Mail className="w-3 h-3" />
                          <span>{member.profile?.email || 'No email'}</span>
                          {member.profile?.phone && (
                            <>
                              <Phone className="w-3 h-3 ml-2" />
                              <span>{member.profile.phone}</span>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{member.role}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingId(member.id)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveStaff(member.id, member)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StaffManagement;
