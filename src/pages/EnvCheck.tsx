import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const EnvCheck = () => {
  const envVars = {
    NODE_ENV: import.meta.env.NODE_ENV,
    MODE: import.meta.env.MODE,
    PROD: import.meta.env.PROD,
    DEV: import.meta.env.DEV,
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing',
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24 lg:pb-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables Check</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(envVars).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="font-medium">{key}:</span>
                  <span className={value === 'Missing' ? 'text-red-600' : 'text-green-600'}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h3 className="font-medium mb-2">All Environment Variables:</h3>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(import.meta.env, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnvCheck;


