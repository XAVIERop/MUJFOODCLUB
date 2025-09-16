import React from 'react';

const DebugEnv = () => {
  const envVars = {
    NODE_ENV: import.meta.env.NODE_ENV,
    MODE: import.meta.env.MODE,
    PROD: import.meta.env.PROD,
    DEV: import.meta.env.DEV,
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Debug Environment Variables</h1>
      <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px', marginBottom: '20px' }}>
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key} style={{ marginBottom: '5px' }}>
            <strong>{key}:</strong> {String(value)}
          </div>
        ))}
      </div>
      
      <div style={{ background: '#e8f4fd', padding: '10px', borderRadius: '5px', marginBottom: '20px' }}>
        <h2>Supabase URL:</h2>
        <div style={{ wordBreak: 'break-all' }}>
          {import.meta.env.VITE_SUPABASE_URL || 'NOT SET'}
        </div>
      </div>
      
      <div style={{ background: '#e8f4fd', padding: '10px', borderRadius: '5px', marginBottom: '20px' }}>
        <h2>Supabase Key:</h2>
        <div style={{ wordBreak: 'break-all' }}>
          {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set (hidden)' : 'NOT SET'}
        </div>
      </div>
      
      <div style={{ background: '#fff3cd', padding: '10px', borderRadius: '5px' }}>
        <h2>All Environment Variables:</h2>
        <pre style={{ fontSize: '12px', maxHeight: '200px', overflowY: 'auto' }}>
          {JSON.stringify(import.meta.env, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default DebugEnv;
