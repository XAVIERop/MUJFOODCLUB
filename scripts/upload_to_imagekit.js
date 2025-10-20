/**
 * Automated ImageKit Upload Script
 * 
 * This script will:
 * 1. Read all used images from the analysis
 * 2. Upload them to ImageKit with same filenames
 * 3. Provide progress tracking and error handling
 * 4. Create a mapping file for reference
 */

import ImageKit from 'imagekit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ImageKit configuration
const imagekit = new ImageKit({
  publicKey: process.env.VITE_IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY, // We'll need to add this to .env.local
  urlEndpoint: process.env.VITE_IMAGEKIT_URL_ENDPOINT
});

// Used images from our analysis (107 files)
const usedImages = [
  'chatkara_logo.jpg',
  'cookhouse_logo.jpg',
  'foodcourt_logo.png',
  'havmor_logo.png',
  'minimeals_logo.png',
  'pizzabakers_logo.jpg',
  'tasteofindia_logo.png',
  'letsgo_logo.png',
  'dialog_logo.JPG',
  'crazychef_logo.png',
  'stardom_logo.jpg',
  'thekitchencurry_logo.png',
  'thewaffleco.png',
  'wafflefit&fresh_logo.png',
  'zerodegreecafe_logo.jpg',
  'soyachaap_logo.png',
  'munchbox_logo.png',
  'zaika_logo.png',
  'teatradition_logo.png',
  'thegarrisonco_card.jpeg',
  'punjabitadka_logo.png',
  'tasteofind_logo.jpeg',
  'italianoven_logo.png',
  'chinatown_logo.png',
  'dev_logo.png',
  'fclog.jpeg',
  'foc.png',
  'favicon.svg',
  'fav.png',
  'pizz.png',
  'pizzalover.png',
  'indianfood.png',
  'chinesedelight.png',
  'authenticindian.png',
  'herobg.png',
  'mobile_bgimg.jpg',
  'menu_hero.png',
  'placeholder.svg',
  'chatkara_bb.png',
  'chatkara_card.png',
  'chatkara_menuimg.png',
  'chatkara_offer.jpeg',
  'cookhouse_banner.jpg',
  'cookhouse_bb.png',
  'cookhouse_card.png',
  'cookhouse_offer.jpeg',
  'foodcourt_bb.png',
  'foodcourt_card.jpg',
  'foodcourt_logo.png',
  'havmor_card.jpg',
  'havmor_logo.png',
  'minimeals_bb.png',
  'minimeals_bbb.png',
  'minimeals_card.png',
  'minimeals_cardhome.png',
  'minimeals_logo.png',
  'pizzabakers_logo.jpg',
  'tasteofindia_card.jpg',
  'tasteofindia_logo.png',
  'letsgolive_card.jpg',
  'dialog_card.jpg',
  'crazychef_logo.png',
  'stardom_card.webp',
  'stardom_logo.jpg',
  'thekitchencurry_logo.png',
  'thewaffleco.png',
  'wafflefit&fresh_logo.png',
  'wafflefitnfresh_card.jpeg',
  'zerodegreecafe_logo.jpg',
  'soyachaap_card.png',
  'soyachaap_logo.png',
  'munchbox_card.png',
  'munchbox_logo.png',
  'zaika_card.jpg',
  'zaika_logo.png',
  'teatradition_card.jpeg',
  'teatradition_logo.png',
  'thegarrisonco_card.jpeg',
  'punjabitadka_card.jpg',
  'punjabitadka_logo.png',
  'tasteofind_logo.jpeg',
  'tasteofindia_card.jpg',
  'tasteofindia_logo.png',
  'italianoven_logo.png',
  'chinatown_logo.png',
  'china_card.png',
  'chinesedelight.png',
  'dev_logo.png',
  'devsweets_card.png',
  'fcc.svg',
  'fclog.jpeg',
  'foc.png',
  'fodcourt_bb.png',
  'foodcourt_card.jpg',
  'foodcourt_logo.png',
  'havmor_card.jpg',
  'havmor_logo.png',
  'herobg.png',
  'image copy.png',
  'image.png',
  'img.png',
  'indianfood.png',
  'italianoven_logo.png',
  'letsgo_logo.png',
  'letsgolive_card.jpg',
  'manifest.json',
  'menu_hero.png',
  'minimeals_bb.png',
  'minimeals_bbb.png',
  'minimeals_card.png',
  'minimeals_cardhome.png',
  'minimeals_logo.png',
  'mobile_bgimg.jpg',
  'munchbox_card.png',
  'munchbox_logo.png',
  'pizz.png',
  'pizzalover.png',
  'pizzabakers_logo.jpg',
  'placeholder.svg',
  'punjabitadka_card.jpg',
  'punjabitadka_logo.png',
  'QuickBites.svg',
  'soyachaap_card.png',
  'soyachaap_logo.png',
  'stardom_card.webp',
  'stardom_logo.jpg',
  'sw.js',
  'tasteofind_logo.jpeg',
  'tasteofindia_card.jpg',
  'tasteofindia_logo.png',
  'teatradition_card.jpeg',
  'teatradition_logo.png',
  'thegarrisonco_card.jpeg',
  'thekitchencurry_logo.png',
  'thewaffleco.png',
  'wafflefit&fresh_logo.png',
  'wafflefitnfresh_card.jpeg',
  'waffles.svg',
  'zaika_card.jpg',
  'zaika_logo.png',
  'zerodegreecafe_logo.jpg'
];

// Category icons
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

// All images to upload
const allImages = [...usedImages, ...categoryIcons];

async function uploadImage(filePath, fileName) {
  try {
    const file = fs.readFileSync(filePath);
    
    const result = await imagekit.upload({
      file: file,
      fileName: fileName,
      folder: '/', // Upload to root folder
      useUniqueFileName: false, // Keep original filename
      tags: ['muj-food-club', 'production']
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

async function uploadAllImages() {
  console.log('🚀 Starting ImageKit Upload Process');
  console.log('=====================================\n');
  
  const publicDir = path.join(__dirname, '..', 'public');
  const results = [];
  let successCount = 0;
  let errorCount = 0;
  
  console.log(`📁 Found ${allImages.length} images to upload\n`);
  
  for (let i = 0; i < allImages.length; i++) {
    const fileName = allImages[i];
    const filePath = path.join(publicDir, fileName);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping ${fileName} - File not found`);
      results.push({
        success: false,
        error: 'File not found',
        fileName: fileName
      });
      errorCount++;
      continue;
    }
    
    console.log(`📤 [${i + 1}/${allImages.length}] Uploading ${fileName}...`);
    
    const result = await uploadImage(filePath, fileName);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ Success: ${result.url}`);
      successCount++;
    } else {
      console.log(`❌ Error: ${result.error}`);
      errorCount++;
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Create results file
  const resultsFile = path.join(__dirname, 'imagekit_upload_results.json');
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
  
  console.log('\n🎉 Upload Process Complete!');
  console.log('==========================');
  console.log(`✅ Successful uploads: ${successCount}`);
  console.log(`❌ Failed uploads: ${errorCount}`);
  console.log(`📄 Results saved to: ${resultsFile}`);
  
  if (successCount > 0) {
    console.log('\n🎯 Next Steps:');
    console.log('1. Verify uploads in ImageKit dashboard');
    console.log('2. Update components to use ImageKit URLs');
    console.log('3. Test the optimized images');
  }
  
  return results;
}

async function main() {
  try {
    // Check if ImageKit credentials are available
    if (!process.env.VITE_IMAGEKIT_PUBLIC_KEY || !process.env.VITE_IMAGEKIT_URL_ENDPOINT) {
      console.error('❌ ImageKit credentials not found in environment variables');
      console.log('Please add IMAGEKIT_PRIVATE_KEY to your .env.local file');
      return;
    }
    
    await uploadAllImages();
    
  } catch (error) {
    console.error('❌ Upload process failed:', error.message);
  }
}

// Run the script
main();
