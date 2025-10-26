// scripts/list_grocery_images.js
// Script to list all images in the grocery/products folder from ImageKit

import dotenv from 'dotenv';
import ImageKit from 'imagekit';

dotenv.config();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.VITE_IMAGEKIT_URL_ENDPOINT
});

async function listGroceryImages() {
  try {
    console.log('🔍 Fetching images from Grocery/Products folder...\n');
    
    // List all files in the Grocery/Products folder
    const result = await imagekit.listFiles({
      path: '/Grocery/Products/',
      limit: 1000 // Adjust if you have more than 1000 images
    });
    
    if (result.length === 0) {
      console.log('❌ No images found in Grocery/Products/ folder');
      return;
    }
    
    console.log(`✅ Found ${result.length} images in Grocery/Products/ folder:\n`);
    
    // Group by file type
    const images = result.filter(file => 
      file.fileType === 'image' && 
      file.filePath.startsWith('/Grocery/Products/')
    );
    
    console.log('📁 Image files:');
    images.forEach((file, index) => {
      const fileName = file.filePath.split('/').pop();
      console.log(`${index + 1}. ${fileName}`);
    });
    
    console.log(`\n📊 Summary:`);
    console.log(`- Total images: ${images.length}`);
    console.log(`- File types: ${[...new Set(images.map(f => f.fileType))].join(', ')}`);
    
    // Show naming patterns
    const patterns = images.map(f => f.filePath.split('/').pop());
    console.log(`\n📝 Naming patterns found:`);
    const uniquePatterns = [...new Set(patterns.map(name => {
      if (name.includes('-')) return 'hyphen-separated';
      if (name.includes('_')) return 'underscore-separated';
      if (name.includes(' ')) return 'space-separated';
      return 'no-separator';
    }))];
    console.log(uniquePatterns.join(', '));
    
  } catch (error) {
    console.error('❌ Error fetching images:', error.message);
  }
}

listGroceryImages();
