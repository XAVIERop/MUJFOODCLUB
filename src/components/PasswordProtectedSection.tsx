import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from './ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { CAFE_CANCELLATION_PASSWORD } from '@/constants/cancellation';

interface PasswordProtectedSectionProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  passwordKey: string; // Key to identify which password to check
  onPasswordVerified?: () => void;
}

const PasswordProtectedSection: React.FC<PasswordProtectedSectionProps> = ({
  children,
  title,
  description,
  passwordKey,
  onPasswordVerified
}) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  // Check if section was already unlocked in this session
  useEffect(() => {
    const sessionKey = `unlocked_${passwordKey}`;
    const unlocked = sessionStorage.getItem(sessionKey);
    if (unlocked === 'true') {
      setIsUnlocked(true);
      onPasswordVerified?.();
    }
  }, [passwordKey, onPasswordVerified]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      toast({
        title: "Account Locked",
        description: "Too many failed attempts. Please try again later.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Get the current user's profile to check permissions
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if user is cafe owner or staff
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_type, cafe_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profileData) {
        throw new Error('Profile not found');
      }

      // Check password based on the section and user role
      let isCorrectPassword = false;
      
      switch (passwordKey) {
        case 'analytics':
          // Analytics access: Only cafe owners with specific password
          isCorrectPassword = password === CAFE_CANCELLATION_PASSWORD && profileData.user_type === 'cafe_owner';
          break;
        case 'database':
          // Database access: Only cafe owners with specific password
          isCorrectPassword = password === CAFE_CANCELLATION_PASSWORD && profileData.user_type === 'cafe_owner';
          break;
        default:
          isCorrectPassword = false;
      }

      if (isCorrectPassword) {
        setIsUnlocked(true);
        setAttempts(0);
        setIsLocked(false);
        setIsExpanded(false);
        
        // Store in session storage
        const sessionKey = `unlocked_${passwordKey}`;
        sessionStorage.setItem(sessionKey, 'true');
        
        onPasswordVerified?.();
        
        toast({
          title: "Access Granted",
          description: "You now have access to this section.",
        });
      } else {
        setAttempts(prev => prev + 1);
        
        if (attempts >= 2) { // Lock after 3 failed attempts
          setIsLocked(true);
          setTimeout(() => {
            setIsLocked(false);
            setAttempts(0);
          }, 300000); // 5 minutes lockout
          
          toast({
            title: "Access Denied",
            description: "Too many failed attempts. Account locked for 5 minutes.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Access Denied",
            description: `Incorrect password. ${3 - attempts} attempts remaining.`,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Password verification error:', error);
      toast({
        title: "Error",
        description: "Failed to verify password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setPassword('');
    }
  };

  const handleLockSection = () => {
    setIsUnlocked(false);
    const sessionKey = `unlocked_${passwordKey}`;
    sessionStorage.removeItem(sessionKey);
    toast({
      title: "Section Locked",
      description: "This section has been locked.",
    });
  };

  if (isUnlocked) {
    return (
      <div className="space-y-4">
        {/* Compact Header */}
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-green-600" />
            <span className="font-medium text-green-800">{title}</span>
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">Unlocked</Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLockSection}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            <Lock className="w-3 h-3 mr-1" />
            Lock
          </Button>
        </div>
        
        {/* Content */}
        {children}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-orange-600" />
          <span className="font-medium text-orange-800">{title}</span>
          <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">Protected</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200"
          >
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {isExpanded ? 'Hide' : 'Unlock'}
          </Button>
        </div>
      </div>

      {/* Collapsible Password Form */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleContent>
          <Card className="border-orange-200 bg-orange-50/30">
            <CardContent className="p-4">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-orange-700">
                  <Lock className="w-5 h-5" />
                  <span className="font-medium">Password Required</span>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  This section contains sensitive information and requires additional authentication.
                </p>

                <form onSubmit={handlePasswordSubmit} className="max-w-sm mx-auto space-y-3">
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLocked || isLoading}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={isLocked || isLoading}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {isLocked && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>Account locked. Please try again in 5 minutes.</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={!password.trim() || isLocked || isLoading}
                    className="w-full"
                    size="sm"
                  >
                    {isLoading ? "Verifying..." : "Unlock Section"}
                  </Button>
                </form>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Analytics access requires cafe owner authentication</p>
                  <p>• Database access requires cafe owner authentication</p>
                  <p>• Password: cafe123</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default PasswordProtectedSection;
