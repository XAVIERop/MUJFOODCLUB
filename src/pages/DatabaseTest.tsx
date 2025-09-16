import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

const DatabaseTest = () => {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testDatabase = async () => {
    setLoading(true);
    const testResults: any = {};

    try {
      // Test 1: Direct table query
      console.log('Testing direct table query...');
      const { data: directData, error: directError } = await supabase
        .from('cafes')
        .select('*')
        .limit(5);

      testResults.directQuery = {
        success: !directError,
        error: directError?.message,
        data: directData,
        count: directData?.length || 0
      };

      // Test 2: RPC function
      console.log('Testing RPC function...');
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_cafes_ordered');

      testResults.rpcQuery = {
        success: !rpcError,
        error: rpcError?.message,
        data: rpcData,
        count: rpcData?.length || 0
      };

      // Test 3: Check if cafes table exists
      console.log('Testing table existence...');
      const { data: tableData, error: tableError } = await supabase
        .from('cafes')
        .select('count')
        .limit(1);

      testResults.tableExists = {
        success: !tableError,
        error: tableError?.message
      };

      // Test 4: Check specific cafe
      console.log('Testing specific cafe query...');
      const { data: cafeData, error: cafeError } = await supabase
        .from('cafes')
        .select('*')
        .eq('name', 'Chatkara')
        .limit(1);

      testResults.specificCafe = {
        success: !cafeError,
        error: cafeError?.message,
        data: cafeData,
        found: cafeData && cafeData.length > 0
      };

    } catch (error) {
      testResults.generalError = error.message;
    }

    setResults(testResults);
    setLoading(false);
  };

  useEffect(() => {
    testDatabase();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Database Test</h1>
      <button onClick={testDatabase} disabled={loading}>
        {loading ? 'Testing...' : 'Test Database Again'}
      </button>
      
      {results && (
        <div style={{ marginTop: '20px' }}>
          <h2>Test Results:</h2>
          <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px', maxHeight: '400px', overflowY: 'auto' }}>
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DatabaseTest;
