import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProAnalytics } from './ProAnalytics';
import { ProRealtimeManager } from './ProRealtimeManager';
import { ProBackupMonitor } from './ProBackupMonitor';
import { ProSupportAccess } from './ProSupportAccess';
import { usePerformanceMonitoring, useDataMaintenance } from '@/hooks/useSupabasePro';
import { Crown, TrendingUp, Shield, Users, Database, Zap } from 'lucide-react';

interface ProDashboardProps {
  cafeId: string;
}

export const ProDashboard = ({ cafeId }: ProDashboardProps) => {
  const { metrics } = usePerformanceMonitoring();
  const { performCleanup, isCleaning } = useDataMaintenance();

  const handleCleanup = async () => {
    try {
      await performCleanup();
      // Show success message
    } catch (error) {
      console.error('Cleanup failed:', error);
      // Show error message
    }
  };

  return (
    <div className="space-y-6">
      {/* Pro Plan Header */}
      <Card className="border-gradient-to-r from-blue-500 to-purple-600 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Crown className="w-8 h-8 text-yellow-500" />
              <div>
                <CardTitle className="text-2xl text-blue-900">
                  Supabase Pro Dashboard
                </CardTitle>
                <p className="text-blue-700">
                  Advanced features and monitoring for your food delivery platform
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-600 font-medium">Pro Plan Active</div>
              <div className="text-xs text-blue-500">$25/month</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">8GB</div>
                <div className="text-xs text-muted-foreground">Database Storage</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">100K</div>
                <div className="text-xs text-muted-foreground">Monthly Users</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">500</div>
                <div className="text-xs text-muted-foreground">Real-time Connections</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">7</div>
                <div className="text-xs text-muted-foreground">Backup Days</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="realtime" className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Real-time</span>
          </TabsTrigger>
          <TabsTrigger value="backups" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Backups</span>
          </TabsTrigger>
          <TabsTrigger value="support" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Support</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          <ProAnalytics cafeId={cafeId} />
        </TabsContent>

        <TabsContent value="realtime" className="space-y-4">
          <ProRealtimeManager cafeId={cafeId} />
        </TabsContent>

        <TabsContent value="backups" className="space-y-4">
          <ProBackupMonitor />
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <ProSupportAccess />
        </TabsContent>
      </Tabs>

      {/* Performance Monitoring */}
      {metrics && metrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Performance Monitoring</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm font-medium">Slow Queries Detected</div>
              {metrics.slice(0, 3).map((query: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-yellow-50 rounded border">
                  <div className="text-sm">
                    <div className="font-medium">Query #{index + 1}</div>
                    <div className="text-xs text-muted-foreground">
                      {query.calls} calls
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {query.mean_time.toFixed(2)}ms avg
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {query.total_time.toFixed(2)}ms total
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Maintenance Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Perform routine maintenance tasks to keep your database optimized.
            </div>
            <button
              onClick={handleCleanup}
              disabled={isCleaning}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isCleaning ? 'Cleaning...' : 'Run Data Cleanup'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
