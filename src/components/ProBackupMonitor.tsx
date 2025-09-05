import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, AlertCircle, Clock, Database } from 'lucide-react';

export const ProBackupMonitor = () => {
  const [backupStatus, setBackupStatus] = useState({
    lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
    nextBackup: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    retentionDays: 7,
    totalBackups: 7,
    backupSize: '2.3 GB',
    status: 'healthy' as 'healthy' | 'warning' | 'error'
  });

  const [isChecking, setIsChecking] = useState(false);

  const checkBackupStatus = async () => {
    setIsChecking(true);
    // Simulate backup check
    await new Promise(resolve => setTimeout(resolve, 2000));
    setBackupStatus(prev => ({
      ...prev,
      lastBackup: new Date(),
      status: 'healthy'
    }));
    setIsChecking(false);
  };

  const getStatusIcon = () => {
    switch (backupStatus.status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (backupStatus.status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimeUntilNext = () => {
    const now = new Date();
    const next = backupStatus.nextBackup;
    const diff = next.getTime() - now.getTime();
    
    if (diff <= 0) return 'Overdue';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="w-5 h-5" />
          <span>Pro Backup Monitor</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Backup Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className="font-medium">Backup Status</span>
          </div>
          <Badge className={getStatusColor()}>
            {backupStatus.status.toUpperCase()}
          </Badge>
        </div>

        {/* Last Backup */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-500" />
            <span className="font-medium">Last Backup</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">
              {backupStatus.lastBackup.toLocaleDateString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {backupStatus.lastBackup.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Next Backup */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-purple-500" />
            <span className="font-medium">Next Backup</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">
              {formatTimeUntilNext()}
            </div>
            <div className="text-xs text-muted-foreground">
              {backupStatus.nextBackup.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Backup Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">
              {backupStatus.retentionDays}
            </div>
            <div className="text-xs text-muted-foreground">
              Retention Days
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">
              {backupStatus.totalBackups}
            </div>
            <div className="text-xs text-muted-foreground">
              Total Backups
            </div>
          </div>
        </div>

        {/* Backup Size */}
        <div className="flex items-center justify-between">
          <span className="font-medium">Backup Size</span>
          <span className="text-sm font-medium">{backupStatus.backupSize}</span>
        </div>

        {/* Check Backup Button */}
        <Button 
          onClick={checkBackupStatus} 
          variant="outline" 
          className="w-full"
          disabled={isChecking}
        >
          {isChecking ? 'Checking...' : 'Check Backup Status'}
        </Button>

        {/* Pro Plan Benefits */}
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <div className="text-sm font-medium text-green-900 mb-2">
            Pro Plan Backup Features:
          </div>
          <ul className="text-xs text-green-700 space-y-1">
            <li>• Daily automated backups</li>
            <li>• 7-day retention period</li>
            <li>• Point-in-time recovery</li>
            <li>• Backup integrity monitoring</li>
            <li>• Email notifications for failures</li>
          </ul>
        </div>

        {/* Backup History */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Recent Backups</div>
          <div className="space-y-1">
            {Array.from({ length: 5 }).map((_, index) => {
              const date = new Date(Date.now() - index * 24 * 60 * 60 * 1000);
              return (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>{date.toLocaleDateString()}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {date.toLocaleTimeString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
