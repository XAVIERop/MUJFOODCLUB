// Debug script to check environment variables in production
// Add this to your production site temporarily to debug

console.log('🔍 DEBUG: Environment Variables Check');
console.log('=====================================');

// Check main API key
const mainApiKey = import.meta.env.VITE_PRINTNODE_API_KEY;
console.log('VITE_PRINTNODE_API_KEY:', mainApiKey ? 'SET' : 'NOT SET');
console.log('VITE_PRINTNODE_API_KEY value:', mainApiKey?.substring(0, 10) + '...');

// Check cafe-specific API keys
const cafeApiKeys = {
  'VITE_CHATKARA_PRINTNODE_API_KEY': import.meta.env.VITE_CHATKARA_PRINTNODE_API_KEY,
  'VITE_COOKHOUSE_PRINTNODE_API_KEY': import.meta.env.VITE_COOKHOUSE_PRINTNODE_API_KEY,
  'VITE_FOODCOURT_PRINTNODE_API_KEY': import.meta.env.VITE_FOODCOURT_PRINTNODE_API_KEY,
  'VITE_PUNJABI_TADKA_PRINTNODE_API_KEY': import.meta.env.VITE_PUNJABI_TADKA_PRINTNODE_API_KEY,
  'VITE_PIZZA_BAKERS_PRINTNODE_API_KEY': import.meta.env.VITE_PIZZA_BAKERS_PRINTNODE_API_KEY,
  'VITE_MUNCHBOX_PRINTNODE_API_KEY': import.meta.env.VITE_MUNCHBOX_PRINTNODE_API_KEY
};

console.log('\nCafe-Specific API Keys:');
Object.entries(cafeApiKeys).forEach(([key, value]) => {
  const status = value ? 'SET' : 'NOT SET';
  const preview = value ? value.substring(0, 10) + '...' : 'undefined';
  console.log(`${key}: ${status} (${preview})`);
});

// Check if any API key is available
const hasAnyApiKey = mainApiKey || Object.values(cafeApiKeys).some(key => key);
console.log('\nAny API Key Available:', hasAnyApiKey ? 'YES' : 'NO');

// Test cafe name matching
const testCafeName = (cafeName) => {
  console.log(`\nTesting cafe: "${cafeName}"`);
  console.log('Contains chatkara:', cafeName.toLowerCase().includes('chatkara'));
  console.log('Contains food court:', cafeName.toLowerCase().includes('food court'));
  console.log('Contains punjabi:', cafeName.toLowerCase().includes('punjabi'));
  console.log('Contains tadka:', cafeName.toLowerCase().includes('tadka'));
  console.log('Contains pizza:', cafeName.toLowerCase().includes('pizza'));
  console.log('Contains bakers:', cafeName.toLowerCase().includes('bakers'));
};

// Test with common cafe names
testCafeName('Chatkara');
testCafeName('Food Court');
testCafeName('Punjabi Tadka');
testCafeName('Pizza Bakers');
testCafeName('Cook House');
testCafeName('Munch Box');

export { mainApiKey, cafeApiKeys };
