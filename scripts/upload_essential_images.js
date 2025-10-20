/**
 * Essential Images Upload to ImageKit
 * 
 * This script uploads the core images that are actually used in the app
 */

import ImageKit from 'imagekit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Essential images that are actually used
const essentialImages = [
  'chatkara_logo.jpg',
  'cookhouse_logo.jpg', 
  'foodcourt.png',
  'favicon.svg',
  'fav.png',
  'chinese.svg',
  'chatkaramenu.pdf',
  'cookhousemenu.pdf',
  'foodcourtmenu.pdf',
  'havmormenu.pdf'
];

// Category icons from src/assets
const categoryIcons = [
  'pizza.svg',
  'NorthIndian.svg', 
  'chinese.svg',
  'deserts.svg',
  'chaap.svg',
  'multicuisine.svg',
  'waffles.svg',
  'icecream.svg',
  'beverages.svg',
  'QuickBites.svg',
  'momos.svg',
  'rolls.svg',
  'sandwiches.svg',
  'coffee.svg'
];

async function uploadImage(filePath, fileName) {
  try {
    const file = fs.readFileSync(filePath);
    
    const result = await imagekit.upload({
      file: file,
      fileName: fileName,
      folder: '/',
      useUniqueFileName: false,
      tags: ['muj-food-club', 'essential']
    });
    
    return {
      success: true,
      fileId: result.fileId,
      url: result.url,
      fileName: result.name
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      fileName: fileName
    };
  }
}

async function main() {
  console.log('🚀 Essential Images Upload to ImageKit');
  console.log('======================================\n');
  
  // Check credentials
  if (!process.env.VITE_IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY) {
    console.error('❌ Missing ImageKit credentials');
    console.log('Please add IMAGEKIT_PRIVATE_KEY to your .env.local file');
    console.log('Get it from: https://imagekit.io/dashboard/developer/api-keys');
    return;
  }
  
  const imagekit = new ImageKit({
    publicKey: process.env.VITE_IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.VITE_IMAGEKIT_URL_ENDPOINT
  });
  
  const publicDir = path.join(__dirname, '..', 'public');
  const results = [];
  let successCount = 0;
  let errorCount = 0;
  
  console.log(`📁 Uploading ${essentialImages.length} essential images\n`);
  
  for (let i = 0; i < essentialImages.length; i++) {
    const fileName = essentialImages[i];
    const filePath = path.join(publicDir, fileName);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping ${fileName} - File not found`);
      continue;
    }
    
    console.log(`📤 [${i + 1}/${essentialImages.length}] Uploading ${fileName}...`);
    
    try {
      const file = fs.readFileSync(filePath);
      
      const result = await imagekit.upload({
        file: file,
        fileName: fileName,
        folder: '/',
        useUniqueFileName: false,
        tags: ['muj-food-club', 'essential']
      });
      
      console.log(`✅ Success: ${result.url}`);
      results.push({
        success: true,
        fileId: result.fileId,
        url: result.url,
        fileName: result.name
      });
      successCount++;
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      results.push({
        success: false,
        error: error.message,
        fileName: fileName
      });
      errorCount++;
    }
    
    // Small delay
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // Save results
  const resultsFile = path.join(__dirname, 'imagekit_upload_results.json');
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
  
  console.log('\n🎉 Upload Complete!');
  console.log('==================');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`📄 Results: ${resultsFile}`);
  
  if (successCount > 0) {
    console.log('\n🎯 Next Steps:');
    console.log('1. Check ImageKit dashboard: https://imagekit.io/dashboard/media-library');
    console.log('2. Test with: http://localhost:8080/imagekit-test');
    console.log('3. Update components to use ImageKit URLs');
  }
}

main().catch(console.error);
