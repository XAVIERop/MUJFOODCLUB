#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 CHECKING EXTENSIONS FOR MISSING PRODUCTS');
console.log('=' .repeat(60));

// List of missing products
const missingProducts = [
  '7UP',
  'ACT II Butter Popcorn',
  'ACT II Salted Popcorn',
  'Balaji Crunchem Masala Masti',
  'Balaji Crunchem Simply Salted',
  'Balaji Crunchex Tomato Twist',
  'Choco-Choco',
  'Coca-Cola',
  'Coca-Cola (Large)',
  'Fanta',
  'Fanta (300ml)',
  'Lays Classic Salted',
  'Lays Popcorn',
  'Limca',
  'Mountain Dew',
  'Nimbu',
  'Orange Pulpy',
  'PAPERBOAT PAPERBOAT SWING COCONUT WATER DRINK',
  'PAPERBOAT PAPERBOAT SWING LUSH LYCHES',
  'PAPERBOAT PAPERBOAT SWING MIXED FRUIT MEDLEY',
  'PAPERBOAT PAPERBOAT SWING SLEEPY MANGO',
  'PAPERBOAT PAPERBOAT SWING YUMMY GUAVA JUICIER DRINK',
  'PAPERBOAT PAPERBOAT SWING ZESTY POMEGRANATE 45',
  'PAPERBOAT PAPERBOAT ZERO SPARKLING WATER GREEN APPLE',
  'PAPERBOAT PAPERBOAT ZERO SPARKLING WATER LEMON LIME',
  'Tropicana Guava'
];

// Check if we can find these in the original product images folder
const productImagesDir = path.join(__dirname, '..', 'product images');

if (!fs.existsSync(productImagesDir)) {
  console.log('❌ Original product images folder not found');
  console.log('💡 The folder was cleaned up after processing');
  console.log('');
  console.log('🔍 ALTERNATIVE APPROACH:');
  console.log('Let me check what extensions you might have by looking at common patterns...');
  
  console.log('\\n📝 COMMON EXTENSION PATTERNS FOR MISSING PRODUCTS:');
  console.log('-' .repeat(50));
  
  missingProducts.forEach(product => {
    console.log(`📦 ${product}`);
    console.log(`   Try these names in ImageKit:`);
    console.log(`   - ${product}.webp`);
    console.log(`   - ${product}.jpg`);
    console.log(`   - ${product}.png`);
    console.log(`   - ${product}.jpeg`);
    console.log(`   - ${product}.avif`);
    console.log('');
  });
  
} else {
  console.log('✅ Found original product images folder');
  
  // Scan for images that might match missing products
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];
  const allImages = [];
  
  function scanDirectory(dirPath, relativePath = '') {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const relativeItemPath = relativePath ? path.join(relativePath, item) : item;
      
      if (fs.statSync(fullPath).isDirectory()) {
        scanDirectory(fullPath, relativeItemPath);
      } else {
        const ext = path.extname(item).toLowerCase();
        if (imageExtensions.includes(ext)) {
          allImages.push({
            fileName: item,
            nameWithoutExt: path.basename(item, ext),
            extension: ext,
            path: relativeItemPath
          });
        }
      }
    }
  }
  
  scanDirectory(productImagesDir);
  
  console.log(`\n📁 Found ${allImages.length} images in original folder`);
  
  console.log('\n🔍 CHECKING FOR MISSING PRODUCTS:');
  console.log('-' .repeat(50));
  
  missingProducts.forEach(product => {
    console.log(`\n📦 Looking for: ${product}`);
    
    // Try to find matches
    const matches = allImages.filter(img => {
      const imgLower = img.nameWithoutExt.toLowerCase();
      const productLower = product.toLowerCase();
      
      // Check for exact match or partial match
      return imgLower === productLower || 
             imgLower.includes(productLower) || 
             productLower.includes(imgLower);
    });
    
    if (matches.length > 0) {
      console.log(`   ✅ Found ${matches.length} potential matches:`);
      matches.forEach(match => {
        console.log(`   - ${match.fileName} (${match.path})`);
      });
    } else {
      console.log(`   ❌ No matches found`);
    }
  });
}

console.log('\\n💡 SOLUTION:');
console.log('1. Check ImageKit for these exact names with different extensions');
console.log('2. Upload missing images with correct names');
console.log('3. Or rename existing images in ImageKit to match database names');
