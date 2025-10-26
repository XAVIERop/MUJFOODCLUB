// scripts/test_direct_mapping.js
// Test the direct mapping approach

import { getGroceryProductImage } from '../src/utils/groceryImageMatcher.js';

const testProducts = [
  'CRAX NATKHAT CLASSIC',
  'CRAX NATKHAT MASALA', 
  'BINGO MAD ANGLES RED ALERT',
  'MAZZA',
  'THUMS UP (LARGE)',
  'MONSTER WHITE ULTRA',
  'FANTA',
  'LIMCA',
  'SPRITE',
  'TROPICANA MIXFURIT',
  'SWING GUAVA',
  'ORANGE PULPY',
  'NUMBOOZ'
];

console.log('🧪 Testing Direct Mapping Approach\n');
console.log('='.repeat(50));

testProducts.forEach(product => {
  const imageUrl = getGroceryProductImage(product);
  console.log(`📦 ${product}`);
  console.log(`   🖼️  ${imageUrl}`);
  console.log('');
});

console.log('✅ Direct mapping test complete!');
