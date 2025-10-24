#!/usr/bin/env node

/**
 * Check Missing Images for ImageKit Upload
 * Identifies images that need to be uploaded to ImageKit
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 CHECKING MISSING IMAGES FOR IMAGEKIT');
console.log('======================================\n');

// Critical images that should be in ImageKit
const criticalImages = [
  // Main banner/hero images
  'menu_hero.png',
  'herobg.png', 
  'mobile_bgimg.jpg',
  
  // Cafe card images
  'foodcourt_card.jpg',
  'chatkara_card.png',
  'minimeals_card.png',
  'cookhouse_card.png',
  
  // Promotional banners
  'chaap_homebanner.png',
  'cookhouse_banner.jpg',
  
  // Cafe logos
  'foodcourt_logo.png',
  'chatkara_logo.jpg',
  'minimeals_logo.png',
  'cookhouse_logo.jpg'
];

console.log('📋 CRITICAL IMAGES TO UPLOAD TO IMAGEKIT:');
console.log('==========================================\n');

let foundCount = 0;
let missingCount = 0;

criticalImages.forEach(imageName => {
  const publicPath = `public/${imageName}`;
  const optimizedPath = `public/optimized_images/${imageName.replace(/\.(png|jpg|jpeg)$/i, '.webp')}`;
  
  let found = false;
  let size = 0;
  let actualPath = '';
  
  // Check in public directory
  if (fs.existsSync(publicPath)) {
    const stats = fs.statSync(publicPath);
    size = stats.size;
    actualPath = publicPath;
    found = true;
  }
  // Check in optimized directory
  else if (fs.existsSync(optimizedPath)) {
    const stats = fs.statSync(optimizedPath);
    size = stats.size;
    actualPath = optimizedPath;
    found = true;
  }
  
  if (found) {
    foundCount++;
    const sizeMB = (size / 1024 / 1024).toFixed(2);
    console.log(`✅ ${imageName}: ${sizeMB}MB (${actualPath})`);
  } else {
    missingCount++;
    console.log(`❌ ${imageName}: NOT FOUND`);
  }
});

console.log(`\n📊 SUMMARY:`);
console.log(`   Found: ${foundCount}`);
console.log(`   Missing: ${missingCount}`);

if (missingCount > 0) {
  console.log(`\n🚨 ACTION REQUIRED:`);
  console.log(`   Upload the missing images to ImageKit dashboard`);
  console.log(`   Keep the same file names in ImageKit`);
}

console.log(`\n💡 UPLOAD INSTRUCTIONS:`);
console.log(`1. Go to ImageKit dashboard`);
console.log(`2. Upload these images with exact same names`);
console.log(`3. Don't change folder structure`);
console.log(`4. Test your site after upload`);

// Check for large images that might cause issues
console.log(`\n🔍 LARGE IMAGES (>1MB):`);
console.log(`=======================`);

const publicDir = 'public';
const largeImages = [];

function scanForLargeImages(dir, relativePath = '') {
  if (!fs.existsSync(dir)) return;
  
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && item !== 'node_modules' && item !== 'dist') {
      scanForLargeImages(fullPath, path.join(relativePath, item));
    } else if (/\.(png|jpg|jpeg|webp)$/i.test(item)) {
      if (stat.size > 1024 * 1024) { // > 1MB
        largeImages.push({
          name: item,
          path: path.join(relativePath, item),
          size: stat.size,
          sizeMB: (stat.size / 1024 / 1024).toFixed(2)
        });
      }
    }
  });
}

scanForLargeImages(publicDir);

largeImages.sort((a, b) => b.size - a.size).forEach((img, index) => {
  console.log(`${index + 1}. ${img.path}: ${img.sizeMB}MB`);
});

if (largeImages.length > 0) {
  console.log(`\n⚠️  WARNING: Large images detected!`);
  console.log(`   These might cause slow loading`);
  console.log(`   Consider compressing them before upload`);
}
