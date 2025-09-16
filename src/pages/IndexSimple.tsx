import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

const IndexSimple = () => {
  console.log('🎬 IndexSimple component rendering...');
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('🚀 IndexSimple: useEffect triggered');
    
    const fetchCafes = async () => {
      try {
        console.log('🔍 IndexSimple: Starting cafe fetch...');
        setLoading(true);
        
        const { data, error } = await supabase.rpc('get_cafes_ordered');
        
        if (error) {
          console.error('❌ IndexSimple: RPC error:', error);
          setError(error.message);
        } else {
          console.log('✅ IndexSimple: Got cafes:', data?.length || 0);
          setCafes(data || []);
        }
      } catch (err) {
        console.error('❌ IndexSimple: Exception:', err);
        setError(err.message);
      } finally {
        console.log('🏁 IndexSimple: Setting loading to false');
        setLoading(false);
      }
    };

    fetchCafes();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Loading cafes...</h1>
        <p>Please wait...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Error: {error}</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Success! Found {cafes.length} cafes</h1>
      <ul>
        {cafes.slice(0, 5).map((cafe, index) => (
          <li key={index}>{cafe.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default IndexSimple;
