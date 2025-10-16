import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const DatabaseTest = () => {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testDatabaseConnection = async () => {
    setTestResults([]);
    addResult('🔍 Testing database connection...');

    try {
      // Test 1: Basic connection
      addResult('Test 1: Basic Supabase connection...');
      const { data: connectionTest, error: connectionError } = await supabase
        .from('cafes')
        .select('count')
        .limit(1);
      
      if (connectionError) {
        addResult(`❌ Connection failed: ${connectionError.message}`);
        return;
      }
      addResult('✅ Basic connection successful');

      // Test 2: Check if referral_codes table exists
      addResult('Test 2: Checking referral_codes table...');
      const { data: referralCodes, error: referralError } = await supabase
        .from('referral_codes')
        .select('*')
        .limit(5);

      if (referralError) {
        addResult(`❌ referral_codes table error: ${referralError.message}`);
        return;
      }
      addResult(`✅ referral_codes table exists with ${referralCodes?.length || 0} records`);

      // Test 3: Check for TEAM123 specifically
      addResult('Test 3: Checking for TEAM123...');
      const { data: team123, error: team123Error } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('code', 'TEAM123')
        .eq('is_active', true);

      if (team123Error) {
        addResult(`❌ TEAM123 query error: ${team123Error.message}`);
        return;
      }

      if (team123 && team123.length > 0) {
        addResult(`✅ TEAM123 found: ${team123[0].team_member_name}`);
      } else {
        addResult('❌ TEAM123 not found or not active');
      }

      // Test 4: List all referral codes
      addResult('Test 4: Listing all referral codes...');
      if (referralCodes && referralCodes.length > 0) {
        referralCodes.forEach(code => {
          addResult(`   - ${code.code}: ${code.team_member_name} (${code.is_active ? 'active' : 'inactive'})`);
        });
      } else {
        addResult('   No referral codes found in database');
      }

    } catch (error) {
      addResult(`❌ Unexpected error: ${error}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              🔍 Database Connection Test
            </CardTitle>
            <p className="text-center text-gray-600">
              Test referral system database connection and data
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={testDatabaseConnection} className="bg-blue-600 hover:bg-blue-700">
                  Run Database Tests
                </Button>
                <Button onClick={clearResults} variant="outline">
                  Clear Results
                </Button>
              </div>
              
              {testResults.length > 0 && (
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Test Results:</h4>
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {testResults.map((result, index) => (
                      <div key={index} className="text-sm font-mono">
                        {result}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">What This Tests:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Basic Supabase database connection</li>
                <li>• referral_codes table existence and structure</li>
                <li>• Specific TEAM123 code lookup</li>
                <li>• All available referral codes in database</li>
              </ul>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DatabaseTest;
