/**
 * Upload All Used Images to ImageKit
 * Based on the analysis from USED_IMAGES_LIST.md
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

// All used images from the analysis (107 files)
const allUsedImages = [
  // Cafe logos
  'chatkara_logo.jpg', 'cookhouse_logo.jpg', 'foodcourt_logo.png', 'havmor_logo.png',
  'minimeals_logo.png', 'pizzabakers_logo.jpg', 'tasteofindia_logo.png', 'letsgo_logo.png',
  'dialog_logo.JPG', 'crazychef_logo.png', 'stardom_logo.jpg', 'thekitchencurry_logo.png',
  'thewaffleco.png', 'wafflefit&fresh_logo.png', 'zerodegreecafe_logo.jpg', 'soyachaap_logo.png',
  'munchbox_logo.png', 'zaika_logo.png', 'teatradition_logo.png', 'thegarrisonco_card.jpeg',
  'punjabitadka_logo.png', 'tasteofind_logo.jpeg', 'italianoven_logo.png', 'chinatown_logo.png',
  'dev_logo.png', 'fclog.jpeg', 'foc.png', 'favicon.svg', 'fav.png', 'pizz.png', 'pizzalover.png',
  'indianfood.png', 'chinesedelight.png', 'authenticindian.png', 'herobg.png', 'mobile_bgimg.jpg',
  'menu_hero.png', 'placeholder.svg',
  
  // Cafe cards and banners
  'chatkara_bb.png', 'chatkara_card.png', 'chatkara_menuimg.png', 'chatkara_offer.jpeg',
  'cookhouse_banner.jpg', 'cookhouse_bb.png', 'cookhouse_card.png', 'cookhouse_offer.jpeg',
  'foodcourt_bb.png', 'foodcourt_card.jpg', 'havmor_card.jpg', 'minimeals_bb.png',
  'minimeals_bbb.png', 'minimeals_card.png', 'minimeals_cardhome.png', 'tasteofindia_card.jpg',
  'letsgolive_card.jpg', 'dialog_card.jpg', 'stardom_card.webp', 'thewaffleco.png',
  'wafflefitnfresh_card.jpeg', 'soyachaap_card.png', 'munchbox_card.png', 'zaika_card.jpg',
  'teatradition_card.jpeg', 'thegarrisonco_card.jpeg', 'punjabitadka_card.jpg', 'tasteofind_logo.jpeg',
  'china_card.png', 'devsweets_card.png', 'fodcourt_bb.png', 'havmor_card.jpg', 'image copy.png',
  'image.png', 'img.png', 'letsgolive_card.jpg', 'munchbox_card.png', 'punjabitadka_card.jpg',
  'soyachaap_card.png', 'stardom_card.webp', 'tasteofindia_card.jpg', 'teatradition_card.jpeg',
  'thegarrisonco_card.jpeg', 'thewaffleco.png', 'wafflefitnfresh_card.jpeg', 'zaika_card.jpg',
  
  // Category icons
  'pizza.svg', 'NorthIndian.svg', 'chinese.svg', 'deserts.svg', 'chaap.svg', 'multicuisine.svg',
  'waffles.svg', 'icecream.svg', 'beverages.svg', 'QuickBites.svg', 'momos.svg', 'rolls.svg',
  'sandwiches.svg', 'coffee.svg',
  
  // PDFs
  'chatkaramenu.pdf', 'cookhousemenu.pdf', 'foodcourtmenu.pdf', 'havmormenu.pdf'
];

async function uploadImage(filePath, fileName) {
  try {
    const file = fs.readFileSync(filePath);
    
    const result = await imagekit.upload({
      file: file,
      fileName: fileName,
      folder: '/',
      useUniqueFileName: false,
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

async function main() {
  console.log('🚀 Uploading All Used Images to ImageKit');
  console.log('========================================\n');
  
  // Check credentials
  if (!process.env.VITE_IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY) {
    console.error('❌ Missing ImageKit credentials');
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
  
  console.log(`📁 Uploading ${allUsedImages.length} images\n`);
  
  for (let i = 0; i < allUsedImages.length; i++) {
    const fileName = allUsedImages[i];
    const filePath = path.join(publicDir, fileName);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping ${fileName} - File not found`);
      continue;
    }
    
    console.log(`📤 [${i + 1}/${allUsedImages.length}] Uploading ${fileName}...`);
    
    try {
      const file = fs.readFileSync(filePath);
      
      const result = await imagekit.upload({
        file: file,
        fileName: fileName,
        folder: '/',
        useUniqueFileName: false,
        tags: ['muj-food-club', 'production']
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
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Save results
  const resultsFile = path.join(__dirname, 'imagekit_all_upload_results.json');
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
  
  console.log('\n🎉 Upload Complete!');
  console.log('==================');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`📄 Results: ${resultsFile}`);
  
  if (successCount > 0) {
    console.log('\n🎯 Next Steps:');
    console.log('1. Check ImageKit dashboard: https://imagekit.io/dashboard/media-library');
    console.log('2. Verify all images are uploaded correctly');
    console.log('3. Plan component migration strategy');
  }
}

main().catch(console.error);
