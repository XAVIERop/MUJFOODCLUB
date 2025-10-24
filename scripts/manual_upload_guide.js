#!/usr/bin/env node

/**
 * Manual ImageKit Upload Guide
 * Provides a step-by-step guide for manual uploads
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('📋 MANUAL IMAGEKIT UPLOAD GUIDE');
console.log('================================\n');

// Get all images to upload
const publicDir = 'public';
const imagesToUpload = [];

function scanForImages(dir, relativePath = '') {
  if (!fs.existsSync(dir)) return;
  
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && item !== 'node_modules' && item !== 'dist' && item !== 'optimized') {
      scanForImages(fullPath, path.join(relativePath, item));
    } else if (/\.(png|jpg|jpeg|webp|svg)$/i.test(item)) {
      // Skip optimized folder to avoid duplicates
      if (!relativePath.includes('optimized')) {
        imagesToUpload.push({
          name: item,
          path: path.join(relativePath, item),
          fullPath: fullPath,
          size: stat.size,
          sizeMB: (stat.size / 1024 / 1024).toFixed(2)
        });
      }
    }
  });
}

scanForImages(publicDir);

// Sort by priority
const criticalImages = imagesToUpload.filter(img => 
  img.name.includes('card') || 
  img.name.includes('logo') || 
  img.name.includes('banner') ||
  img.name.includes('hero')
);

const otherImages = imagesToUpload.filter(img => 
  !img.name.includes('card') && 
  !img.name.includes('logo') && 
  !img.name.includes('banner') &&
  !img.name.includes('hero')
);

console.log('🎯 UPLOAD PRIORITY ORDER:\n');

console.log('🚨 CRITICAL IMAGES (Upload First):');
criticalImages.forEach((img, index) => {
  console.log(`${index + 1}. ${img.name} (${img.sizeMB}MB) - ${img.fullPath}`);
});

console.log('\n📋 OTHER IMAGES (Upload Later):');
otherImages.forEach((img, index) => {
  console.log(`${index + 1}. ${img.name} (${img.sizeMB}MB) - ${img.fullPath}`);
});

console.log('\n📊 SUMMARY:');
console.log(`   Critical images: ${criticalImages.length}`);
console.log(`   Other images: ${otherImages.length}`);
console.log(`   Total: ${imagesToUpload.length}`);

console.log('\n🚀 MANUAL UPLOAD STEPS:');
console.log('1. Go to https://imagekit.io/dashboard');
console.log('2. Click "Upload" or "Media Library"');
console.log('3. Upload critical images first (see list above)');
console.log('4. Test your website to see if images load');
console.log('5. Upload remaining images in batches');

console.log('\n💡 TIPS:');
console.log('- Upload 5-10 images at a time');
console.log('- Test your website after each batch');
console.log('- Keep the same file names for consistency');
console.log('- Upload to the root folder (not in subfolders)');

console.log('\n🔗 After uploading, your images will be available at:');
console.log('   https://ik.imagekit.io/foodclub/[filename]');
