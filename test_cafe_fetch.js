// Test script to check cafe fetching
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://your-project.supabase.co'; // Replace with actual URL
const SUPABASE_ANON_KEY = 'your-anon-key'; // Replace with actual key

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testCafeFetch() {
  console.log('🧪 Testing cafe fetching...');
  
  try {
    // Test 1: Direct table query
    console.log('\n1. Testing direct table query...');
    const { data: directData, error: directError } = await supabase
      .from('cafes')
      .select('id, name, type, description, location, slug, priority, accepting_orders')
      .eq('is_active', true)
      .order('priority', { ascending: true })
      .limit(10);
    
    if (directError) {
      console.error('❌ Direct query error:', directError);
    } else {
      console.log('✅ Direct query success:', directData?.length || 0, 'cafes');
      console.log('Cafes:', directData?.map(c => c.name));
    }
    
    // Test 2: RPC function
    console.log('\n2. Testing RPC function...');
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_cafes_ordered');
    
    if (rpcError) {
      console.error('❌ RPC query error:', rpcError);
    } else {
      console.log('✅ RPC query success:', rpcData?.length || 0, 'cafes');
      console.log('Cafes:', rpcData?.map(c => c.name));
    }
    
    // Test 3: Check if cafes table exists
    console.log('\n3. Testing table existence...');
    const { data: tableData, error: tableError } = await supabase
      .from('cafes')
      .select('count')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Table access error:', tableError);
    } else {
      console.log('✅ Table access success');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCafeFetch();
