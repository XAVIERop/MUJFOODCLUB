// scripts/find_all_grocery_images.js
// Script to find all grocery-related images in ImageKit

import dotenv from 'dotenv';
import ImageKit from 'imagekit';

dotenv.config();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.VITE_IMAGEKIT_URL_ENDPOINT
});

async function findAllGroceryImages() {
  try {
    console.log('🔍 Searching for all grocery-related images...\n');
    
    // List all files (we'll filter for grocery-related ones)
    const result = await imagekit.listFiles({
      limit: 1000
    });
    
    if (result.length === 0) {
      console.log('❌ No images found in ImageKit');
      return;
    }
    
    console.log(`✅ Found ${result.length} total files in ImageKit\n`);
    
    // Filter for grocery-related images
    const groceryImages = result.filter(file => 
      file.fileType === 'image' && 
      (file.filePath.includes('grocery') || 
       file.filePath.includes('products') ||
       file.name.toLowerCase().includes('grocery'))
    );
    
    if (groceryImages.length === 0) {
      console.log('❌ No grocery-related images found');
      console.log('\n📁 Available folders:');
      const folders = [...new Set(result.map(f => f.filePath.split('/')[1]))];
      folders.forEach(folder => console.log(`- ${folder}`));
      return;
    }
    
    console.log(`🎯 Found ${groceryImages.length} grocery-related images:\n`);
    
    // Group by folder
    const groupedByFolder = {};
    groceryImages.forEach(file => {
      const folder = file.filePath.split('/').slice(0, -1).join('/') || '/';
      if (!groupedByFolder[folder]) {
        groupedByFolder[folder] = [];
      }
      groupedByFolder[folder].push(file);
    });
    
    Object.keys(groupedByFolder).forEach(folder => {
      console.log(`📁 ${folder}:`);
      groupedByFolder[folder].forEach((file, index) => {
        const fileName = file.filePath.split('/').pop();
        console.log(`  ${index + 1}. ${fileName}`);
      });
      console.log('');
    });
    
    // Show naming patterns
    console.log('📝 Naming patterns analysis:');
    const allNames = groceryImages.map(f => f.filePath.split('/').pop());
    const patterns = {
      'hyphen-separated': allNames.filter(name => name.includes('-')).length,
      'underscore-separated': allNames.filter(name => name.includes('_')).length,
      'space-separated': allNames.filter(name => name.includes(' ')).length,
      'no-separator': allNames.filter(name => !name.includes('-') && !name.includes('_') && !name.includes(' ')).length
    };
    
    Object.entries(patterns).forEach(([pattern, count]) => {
      if (count > 0) {
        console.log(`- ${pattern}: ${count} files`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching images:', error.message);
  }
}

findAllGroceryImages();
