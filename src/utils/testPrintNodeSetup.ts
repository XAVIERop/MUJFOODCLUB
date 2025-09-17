// Test utility to verify PrintNode setup
export const testPrintNodeSetup = () => {
  console.log('🔍 Testing PrintNode Environment Variables...\n');

  const envVars = {
    'VITE_FOODCOURT_PRINTNODE_API_KEY': import.meta.env.VITE_FOODCOURT_PRINTNODE_API_KEY,
    'VITE_CHATKARA_PRINTNODE_API_KEY': import.meta.env.VITE_CHATKARA_PRINTNODE_API_KEY,
    'VITE_PRINTNODE_API_KEY': import.meta.env.VITE_PRINTNODE_API_KEY
  };

  console.log('Environment Variables Status:');
  Object.entries(envVars).forEach(([key, value]) => {
    const status = value ? '✅ Set' : '❌ Missing';
    const preview = value ? `${value.substring(0, 10)}...` : 'undefined';
    console.log(`${key}: ${status} (${preview})`);
  });

  // Test cafe-specific API key selection
  const testCafeApiKey = (cafeName: string) => {
    if (cafeName.toLowerCase().includes('chatkara')) {
      return import.meta.env.VITE_CHATKARA_PRINTNODE_API_KEY || '';
    } else if (cafeName.toLowerCase().includes('food court')) {
      return import.meta.env.VITE_FOODCOURT_PRINTNODE_API_KEY || '';
    }
    return import.meta.env.VITE_PRINTNODE_API_KEY || '';
  };

  console.log('\n🧪 Testing Cafe-Specific API Key Selection:');

  return {
    chatkaraApiKey: testCafeApiKey('Chatkara'),
    foodCourtApiKey: testCafeApiKey('Food Court'),
    generalApiKey: import.meta.env.VITE_PRINTNODE_API_KEY
  };
};
