// Setup Cook House Environment Variables
// This script helps set up the Cook House PrintNode environment variable

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Setting up Cook House PrintNode Environment Variables');
console.log('=======================================================');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), 'env.example');

console.log('📁 Checking for .env.local file...');

if (fs.existsSync(envPath)) {
  console.log('✅ Found .env.local file');
  
  // Read current .env.local
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check if Cook House API key is already set
  if (envContent.includes('VITE_COOKHOUSE_PRINTNODE_API_KEY=')) {
    console.log('⚠️  VITE_COOKHOUSE_PRINTNODE_API_KEY already exists in .env.local');
    console.log('📝 Current value:', envContent.match(/VITE_COOKHOUSE_PRINTNODE_API_KEY=(.+)/)?.[1] || 'Not found');
  } else {
    console.log('➕ Adding VITE_COOKHOUSE_PRINTNODE_API_KEY to .env.local...');
    
    // Add Cook House API key
    const cookhouseApiKey = 'VITE_COOKHOUSE_PRINTNODE_API_KEY=n_Trl9Kw4OfgXa9cEQCWrg4eqytQOGwDZJr8wELH6Qc';
    
    // Add after the main PrintNode API key
    if (envContent.includes('VITE_PRINTNODE_API_KEY=')) {
      envContent = envContent.replace(
        /(VITE_PRINTNODE_API_KEY=.+)/,
        `$1\nVITE_COOKHOUSE_PRINTNODE_API_KEY=${cookhouseApiKey.split('=')[1]}`
      );
    } else {
      envContent += `\n# Cook House PrintNode API Key\n${cookhouseApiKey}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Added VITE_COOKHOUSE_PRINTNODE_API_KEY to .env.local');
  }
} else {
  console.log('❌ .env.local file not found');
  console.log('📋 Please create .env.local file with the following content:');
  console.log('');
  console.log('# Copy from env.example and add:');
  console.log('VITE_COOKHOUSE_PRINTNODE_API_KEY=n_Trl9Kw4OfgXa9cEQCWrg4eqytQOGwDZJr8wELH6Qc');
  console.log('');
  console.log('🔧 Or run: cp env.example .env.local');
  console.log('🔧 Then edit .env.local and set the Cook House API key');
}

console.log('');
console.log('📋 Required Environment Variables:');
console.log('   VITE_COOKHOUSE_PRINTNODE_API_KEY=n_Trl9Kw4OfgXa9cEQCWrg4eqytQOGwDZJr8wELH6Qc');
console.log('');
console.log('🎯 Expected Result:');
console.log('   - Cook House orders will use cookhouse.foodclub@gmail.com account');
console.log('   - Printer ID 74781013 (POS 80 C)');
console.log('   - Dedicated Cook House PrintNode configuration');
console.log('');
console.log('🚀 After setting the environment variable:');
console.log('   1. Restart the development server');
console.log('   2. Test with a Cook House order');
console.log('   3. Check that it prints to the correct printer');
