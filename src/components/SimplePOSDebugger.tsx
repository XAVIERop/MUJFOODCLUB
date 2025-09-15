import React from 'react';
import { Button } from '@/components/ui/button';
import { Database } from 'lucide-react';

const SimplePOSDebugger: React.FC<{ cafeId: string | null }> = ({ cafeId }) => {
  const handleDebugClick = () => {
    console.log('🔍 POS Debug: Cafe ID:', cafeId);
    console.log('🔍 POS Debug: Supabase client:', window.supabase || 'Not available');
    console.log('🔍 POS Debug: React version:', React.version);
    console.log('🔍 POS Debug: Current URL:', window.location.href);
    
    // Test basic functionality
    if (window.supabase) {
      window.supabase
        .from('orders')
        .select('count')
        .eq('cafe_id', cafeId)
        .then(({ data, error }) => {
          console.log('🔍 POS Debug: Order count test:', { data, error });
        })
        .catch(err => {
          console.error('🔍 POS Debug: Order count test failed:', err);
        });
    }
  };

  return (
    <Button
      onClick={handleDebugClick}
      variant="outline"
      size="sm"
      className="fixed bottom-4 right-4 z-50"
    >
      <Database className="w-4 h-4 mr-2" />
      Debug POS
    </Button>
  );
};

export default SimplePOSDebugger;
