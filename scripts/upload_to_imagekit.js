#!/usr/bin/env node

/**
 * ImageKit Upload Script
 * Automatically uploads critical images to ImageKit
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('📤 IMAGEKIT UPLOAD ASSISTANT');
console.log('============================\n');

// Critical images that need to be uploaded
const criticalImages = [
  // Main banner images (fix the empty banner area)
  { local: 'public/menu_hero.png', name: 'menu_hero.png', priority: 'HIGH' },
  { local: 'public/optimized_images/herobg.webp', name: 'herobg.png', priority: 'HIGH' },
  { local: 'public/optimized_images/mobile_bgimg.webp', name: 'mobile_bgimg.jpg', priority: 'HIGH' },
  
  // Cafe card images (fix the gray FOOD COURT card)
  { local: 'public/optimized_images/foodcourt_card.webp', name: 'foodcourt_card.jpg', priority: 'CRITICAL' },
  { local: 'public/chatkara_card.png', name: 'chatkara_card.png', priority: 'HIGH' },
  { local: 'public/optimized_images/minimeals_card.webp', name: 'minimeals_card.png', priority: 'HIGH' },
  { local: 'public/cookhouse_card.png', name: 'cookhouse_card.png', priority: 'HIGH' },
  
  // Promotional banners (fix empty promotional areas)
  { local: 'public/chaap_homebanner.png', name: 'chaap_homebanner.png', priority: 'HIGH' },
  { local: 'public/cookhouse_banner.jpg', name: 'cookhouse_banner.jpg', priority: 'HIGH' },
  
  // Cafe logos
  { local: 'public/foodcourt_logo.png', name: 'foodcourt_logo.png', priority: 'MEDIUM' },
  { local: 'public/chatkara_logo.jpg', name: 'chatkara_logo.jpg', priority: 'MEDIUM' },
  { local: 'public/minimeals_logo.png', name: 'minimeals_logo.png', priority: 'MEDIUM' },
  { local: 'public/cookhouse_logo.jpg', name: 'cookhouse_logo.jpg', priority: 'MEDIUM' }
];

console.log('🎯 CRITICAL IMAGES TO UPLOAD:');
console.log('=============================\n');

let foundCount = 0;
let missingCount = 0;
const uploadList = [];

criticalImages.forEach((image, index) => {
  const exists = fs.existsSync(image.local);
  const size = exists ? fs.statSync(image.local).size : 0;
  const sizeMB = (size / 1024 / 1024).toFixed(2);
  
  if (exists) {
    foundCount++;
    uploadList.push(image);
    
    const priorityIcon = image.priority === 'CRITICAL' ? '🚨' : 
                        image.priority === 'HIGH' ? '🔥' : '📋';
    
    console.log(`${priorityIcon} ${index + 1}. ${image.name} (${sizeMB}MB) - ${image.priority}`);
  } else {
    missingCount++;
    console.log(`❌ ${index + 1}. ${image.name} - NOT FOUND`);
  }
});

console.log(`\n📊 SUMMARY:`);
console.log(`   Ready to upload: ${foundCount}`);
console.log(`   Missing locally: ${missingCount}`);

if (foundCount > 0) {
  console.log(`\n🚀 UPLOAD INSTRUCTIONS:`);
  console.log(`=======================`);
  console.log(`1. Go to ImageKit dashboard: https://imagekit.io/dashboard`);
  console.log(`2. Click "Upload" or "Add Files"`);
  console.log(`3. Upload these files in this exact order:\n`);
  
  // Sort by priority
  uploadList.sort((a, b) => {
    const priorityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  uploadList.forEach((image, index) => {
    const priorityIcon = image.priority === 'CRITICAL' ? '🚨' : 
                        image.priority === 'HIGH' ? '🔥' : '📋';
    console.log(`   ${priorityIcon} ${index + 1}. ${image.local} → ${image.name}`);
  });
  
  console.log(`\n💡 UPLOAD TIPS:`);
  console.log(`   • Upload files with EXACT same names`);
  console.log(`   • Don't change folder structure`);
  console.log(`   • Start with CRITICAL files first`);
  console.log(`   • Test after each batch`);
  
  console.log(`\n🎯 PRIORITY ORDER:`);
  console.log(`   1. 🚨 CRITICAL: foodcourt_card.jpg (fixes gray FOOD COURT card)`);
  console.log(`   2. 🔥 HIGH: menu_hero.png, herobg.png (fixes empty banner)`);
  console.log(`   3. 🔥 HIGH: All cafe cards (fixes missing card images)`);
  console.log(`   4. 📋 MEDIUM: Logos and promotional banners`);
  
} else {
  console.log(`\n❌ No images found to upload!`);
  console.log(`   Check if the image files exist in the public directory`);
}

console.log(`\n✅ AFTER UPLOAD:`);
console.log(`   1. Refresh your site`);
console.log(`   2. Check Network tab in DevTools`);
console.log(`   3. Images should load from ik.imagekit.io`);
console.log(`   4. Empty banner and gray cards should be fixed!`);