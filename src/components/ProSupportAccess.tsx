import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Mail, Phone, Clock, CheckCircle, ExternalLink } from 'lucide-react';

export const ProSupportAccess = () => {
  const supportChannels = [
    {
      type: 'Email',
      icon: <Mail className="w-5 h-5" />,
      description: 'Professional email support',
      responseTime: '< 24 hours',
      availability: '24/7',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      action: 'support@supabase.com'
    },
    {
      type: 'Community',
      icon: <MessageCircle className="w-5 h-5" />,
      description: 'Discord community support',
      responseTime: 'Real-time',
      availability: '24/7',
      color: 'bg-green-100 text-green-800 border-green-200',
      action: 'Join Discord'
    },
    {
      type: 'Documentation',
      icon: <ExternalLink className="w-5 h-5" />,
      description: 'Comprehensive docs & guides',
      responseTime: 'Instant',
      availability: '24/7',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      action: 'View Docs'
    }
  ];

  const supportFeatures = [
    'Priority email support with < 24 hour response',
    'Access to Supabase Discord community',
    'Comprehensive documentation and guides',
    'Best practices and optimization tips',
    'Direct access to Supabase team',
    'Proactive monitoring and alerts'
  ];

  const handleContactSupport = (type: string) => {
    switch (type) {
      case 'Email':
        window.open('mailto:support@supabase.com?subject=MUJ Food Club - Pro Support Request', '_blank');
        break;
      case 'Community':
        window.open('https://discord.supabase.com', '_blank');
        break;
      case 'Documentation':
        window.open('https://supabase.com/docs', '_blank');
        break;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <span>Pro Support Access</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Support Status */}
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <div className="font-medium text-green-900">Pro Support Active</div>
                <div className="text-sm text-green-700">
                  Professional support enabled for your project
                </div>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              ACTIVE
            </Badge>
          </div>

          {/* Support Channels */}
          <div className="space-y-3">
            <h4 className="font-medium">Support Channels</h4>
            {supportChannels.map((channel, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {channel.icon}
                  <div>
                    <div className="font-medium">{channel.type}</div>
                    <div className="text-sm text-muted-foreground">
                      {channel.description}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{channel.responseTime}</div>
                  <div className="text-xs text-muted-foreground">
                    {channel.availability}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleContactSupport(channel.type)}
                >
                  {channel.action}
                </Button>
              </div>
            ))}
          </div>

          {/* Support Features */}
          <div className="space-y-3">
            <h4 className="font-medium">Pro Support Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {supportFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <h4 className="font-medium">Quick Actions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => handleContactSupport('Email')}
              >
                <Mail className="w-4 h-4 mr-2" />
                Report an Issue
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => handleContactSupport('Community')}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Ask Community
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => handleContactSupport('Documentation')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Documentation
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Dashboard
              </Button>
            </div>
          </div>

          {/* Support Tips */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h5 className="font-medium text-blue-900 mb-2">Support Tips</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Include your project URL and error messages when contacting support</li>
              <li>• Check the documentation first for common issues</li>
              <li>• Use the Discord community for quick questions</li>
              <li>• Email support for complex technical issues</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
