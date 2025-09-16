import React from 'react';

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
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Environment Variables Check</h1>
      <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key} style={{ marginBottom: '5px' }}>
            <strong>{key}:</strong> {value}
          </div>
        ))}
      </div>
      <div style={{ marginTop: '20px' }}>
        <h2>Supabase URL Value:</h2>
        <div style={{ background: '#e8f4fd', padding: '10px', borderRadius: '5px', wordBreak: 'break-all' }}>
          {import.meta.env.VITE_SUPABASE_URL || 'NOT SET'}
        </div>
      </div>
      <div style={{ marginTop: '20px' }}>
        <h2>Supabase Key Value:</h2>
        <div style={{ background: '#e8f4fd', padding: '10px', borderRadius: '5px', wordBreak: 'break-all' }}>
          {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set (hidden)' : 'NOT SET'}
        </div>
      </div>
    </div>
  );
};

export default EnvCheck;