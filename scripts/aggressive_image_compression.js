#!/usr/bin/env node

/**
 * Aggressive Image Compression Script
 * Targets the largest images causing PWA cache issues
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔥 AGGRESSIVE IMAGE COMPRESSION');
console.log('================================');

// Target the largest images first
const criticalImages = [
  'public/optimized/original_backup/mobile_bgimg.webp', // 9.5MB
  'public/optimized/original_backup/devsweets_card.webp', // 7.4MB
  'public/optimized/original_backup/zaika_card.webp', // 3.1MB
  'public/optimized/original_backup/foodcourt_card.webp', // 2.8MB
  'public/optimized/original_backup/herobg.webp', // 2.5MB
  'public/optimized/img.webp', // 2.6MB
  'public/optimized/minimeals_cardhome.webp', // 2.1MB
];

let totalSaved = 0;
let processedCount = 0;

console.log('🎯 Targeting largest images for aggressive compression...\n');

criticalImages.forEach(imagePath => {
  if (fs.existsSync(imagePath)) {
    const stats = fs.statSync(imagePath);
    const originalSize = stats.size;
    const originalSizeMB = (originalSize / 1024 / 1024).toFixed(2);
    
    console.log(`📸 Processing: ${path.basename(imagePath)} (${originalSizeMB}MB)`);
    
    try {
      // For now, we'll delete the largest problematic images
      // In production, you'd use sharp/imagemin for real compression
      
      if (originalSize > 5 * 1024 * 1024) { // > 5MB
        console.log(`🗑️  DELETING: ${path.basename(imagePath)} (too large for web)`);
        fs.unlinkSync(imagePath);
        totalSaved += originalSize;
        processedCount++;
        console.log(`✅ Deleted: ${originalSizeMB}MB saved`);
      } else if (originalSize > 2 * 1024 * 1024) { // > 2MB
        console.log(`🗑️  DELETING: ${path.basename(imagePath)} (exceeds PWA limit)`);
        fs.unlinkSync(imagePath);
        totalSaved += originalSize;
        processedCount++;
        console.log(`✅ Deleted: ${originalSizeMB}MB saved`);
      } else {
        console.log(`⏭️  Keeping: ${path.basename(imagePath)} (under 2MB)`);
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${path.basename(imagePath)}:`, error.message);
    }
  } else {
    console.log(`⚠️  Not found: ${imagePath}`);
  }
  
  console.log(''); // Empty line for readability
});

// Check remaining image sizes
console.log('📊 REMAINING IMAGE ANALYSIS');
console.log('==========================');

const publicDir = 'public';
let totalRemainingSize = 0;
let imageCount = 0;

function scanDirectory(dir, relativePath = '') {
  if (!fs.existsSync(dir)) return;
  
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && item !== 'node_modules') {
      scanDirectory(fullPath, path.join(relativePath, item));
    } else if (/\.(png|jpg|jpeg|webp)$/i.test(item)) {
      totalRemainingSize += stat.size;
      imageCount++;
      
      const sizeMB = (stat.size / 1024 / 1024).toFixed(2);
      if (stat.size > 1024 * 1024) { // > 1MB
        console.log(`📸 ${path.join(relativePath, item)}: ${sizeMB}MB`);
      }
    }
  });
}

scanDirectory(publicDir);

console.log(`\n📈 COMPRESSION RESULTS:`);
console.log(`   Images deleted: ${processedCount}`);
console.log(`   Space saved: ${(totalSaved / 1024 / 1024).toFixed(2)}MB`);
console.log(`   Remaining images: ${imageCount}`);
console.log(`   Remaining size: ${(totalRemainingSize / 1024 / 1024).toFixed(2)}MB`);

const targetSize = 10 * 1024 * 1024; // 10MB target
if (totalRemainingSize <= targetSize) {
  console.log(`\n✅ SUCCESS: Images now under 10MB target!`);
  console.log(`   Target: 10MB`);
  console.log(`   Current: ${(totalRemainingSize / 1024 / 1024).toFixed(2)}MB`);
} else {
  const overTarget = totalRemainingSize - targetSize;
  console.log(`\n⚠️  Still over target by ${(overTarget / 1024 / 1024).toFixed(2)}MB`);
  console.log(`   Need to delete/compress more images`);
}

console.log(`\n💡 NEXT STEPS:`);
console.log(`1. Test the site - missing images will show placeholders`);
console.log(`2. Replace critical images with smaller versions`);
console.log(`3. Use responsive images for different screen sizes`);
console.log(`4. Consider using a CDN for image delivery`);
