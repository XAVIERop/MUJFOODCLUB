#!/usr/bin/env node

/**
 * Complete ImageKit Migration Script
 * Identifies ALL images that need to be uploaded to ImageKit
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 COMPLETE IMAGEKIT MIGRATION');
console.log('==============================\n');

// Get all images from public directory
const publicDir = 'public';
const allImages = [];

function scanForImages(dir, relativePath = '') {
  if (!fs.existsSync(dir)) return;
  
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && item !== 'node_modules' && item !== 'dist') {
      scanForImages(fullPath, path.join(relativePath, item));
    } else if (/\.(png|jpg|jpeg|webp|svg)$/i.test(item)) {
      allImages.push({
        name: item,
        path: path.join(relativePath, item),
        fullPath: fullPath,
        size: stat.size,
        sizeMB: (stat.size / 1024 / 1024).toFixed(2)
      });
    }
  });
}

scanForImages(publicDir);

console.log(`📊 Found ${allImages.length} images total\n`);

// Categorize images by usage
const criticalImages = [];
const cafeImages = [];
const bannerImages = [];
const logoImages = [];
const otherImages = [];

allImages.forEach(img => {
  const name = img.name.toLowerCase();
  const path = img.path.toLowerCase();
  
  // Critical images (must upload first)
  if (name.includes('foodcourt_card') || 
      name.includes('chatkara_card') || 
      name.includes('minimeals_card') ||
      name.includes('cookhouse_card')) {
    criticalImages.push(img);
  }
  // Banner images
  else if (name.includes('bb') || name.includes('banner') || name.includes('hero')) {
    bannerImages.push(img);
  }
  // Cafe logos
  else if (name.includes('logo')) {
    logoImages.push(img);
  }
  // Other cafe images
  else if (name.includes('card') || name.includes('cafe')) {
    cafeImages.push(img);
  }
  // Everything else
  else {
    otherImages.push(img);
  }
});

console.log('🎯 UPLOAD PRIORITY ORDER:');
console.log('==========================\n');

console.log('🚨 CRITICAL IMAGES (Upload First):');
console.log('===================================');
criticalImages.forEach((img, index) => {
  console.log(`${index + 1}. ${img.path} (${img.sizeMB}MB)`);
});

console.log('\n🔥 BANNER IMAGES:');
console.log('=================');
bannerImages.forEach((img, index) => {
  console.log(`${index + 1}. ${img.path} (${img.sizeMB}MB)`);
});

console.log('\n🏪 CAFE IMAGES:');
console.log('==============');
cafeImages.forEach((img, index) => {
  console.log(`${index + 1}. ${img.path} (${img.sizeMB}MB)`);
});

console.log('\n🏷️  LOGO IMAGES:');
console.log('=================');
logoImages.forEach((img, index) => {
  console.log(`${index + 1}. ${img.path} (${img.sizeMB}MB)`);
});

console.log('\n📋 OTHER IMAGES:');
console.log('=================');
otherImages.slice(0, 10).forEach((img, index) => {
  console.log(`${index + 1}. ${img.path} (${img.sizeMB}MB)`);
});

if (otherImages.length > 10) {
  console.log(`... and ${otherImages.length - 10} more images`);
}

// Calculate total size
const totalSize = allImages.reduce((sum, img) => sum + img.size, 0);
const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);

console.log(`\n📊 MIGRATION SUMMARY:`);
console.log(`   Total images: ${allImages.length}`);
console.log(`   Total size: ${totalSizeMB}MB`);
console.log(`   Critical: ${criticalImages.length}`);
console.log(`   Banners: ${bannerImages.length}`);
console.log(`   Cafes: ${cafeImages.length}`);
console.log(`   Logos: ${logoImages.length}`);
console.log(`   Other: ${otherImages.length}`);

console.log(`\n🚀 MIGRATION STEPS:`);
console.log(`===================`);
console.log(`1. Update .env file with correct ImageKit URL`);
console.log(`2. Upload critical images first (cafe cards)`);
console.log(`3. Upload banner images (hero banners)`);
console.log(`4. Upload cafe images (logos, promotional)`);
console.log(`5. Upload remaining images`);
console.log(`6. Test site thoroughly`);
console.log(`7. Remove local images (optional)`);

console.log(`\n💡 UPLOAD TIPS:`);
console.log(`===============`);
console.log(`• Upload in batches of 10-20 images`);
console.log(`• Test after each batch`);
console.log(`• Keep same folder structure in ImageKit`);
console.log(`• Use exact same file names`);
console.log(`• Start with critical images first`);

console.log(`\n🎯 EXPECTED BENEFITS:`);
console.log(`=====================`);
console.log(`✅ 50-70% faster image loading`);
console.log(`✅ 30-50% smaller file sizes (WebP)`);
console.log(`✅ Global CDN delivery`);
console.log(`✅ Automatic optimization`);
console.log(`✅ Responsive images`);
console.log(`✅ Better user experience`);
