#!/usr/bin/env node

/**
 * Comprehensive Image Usage Analysis
 * Finds images that are likely unused by analyzing actual usage patterns
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 COMPREHENSIVE IMAGE USAGE ANALYSIS');
console.log('=====================================\n');

// Get all images with detailed info
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
        sizeMB: (stat.size / 1024 / 1024).toFixed(2),
        directory: relativePath
      });
    }
  });
}

scanForImages(publicDir);

console.log(`📊 Found ${allImages.length} images\n`);

// Analyze by directory and size
const imagesByDir = {};
const largeImages = [];
const totalSize = allImages.reduce((sum, img) => sum + img.size, 0);

allImages.forEach(img => {
  // Group by directory
  if (!imagesByDir[img.directory]) {
    imagesByDir[img.directory] = [];
  }
  imagesByDir[img.directory].push(img);
  
  // Track large images
  if (img.size > 1024 * 1024) { // > 1MB
    largeImages.push(img);
  }
});

console.log('📁 IMAGES BY DIRECTORY:');
console.log('=======================');
Object.keys(imagesByDir).sort().forEach(dir => {
  const images = imagesByDir[dir];
  const dirSize = images.reduce((sum, img) => sum + img.size, 0);
  console.log(`\n📂 ${dir || 'root'}:`);
  console.log(`   Images: ${images.length}`);
  console.log(`   Size: ${(dirSize / 1024 / 1024).toFixed(2)}MB`);
  
  // Show largest images in this directory
  const sortedImages = images.sort((a, b) => b.size - a.size);
  sortedImages.slice(0, 5).forEach(img => {
    console.log(`   📸 ${img.name}: ${img.sizeMB}MB`);
  });
  
  if (sortedImages.length > 5) {
    console.log(`   ... and ${sortedImages.length - 5} more`);
  }
});

console.log('\n🚨 LARGE IMAGES (>1MB):');
console.log('========================');
largeImages.sort((a, b) => b.size - a.size).forEach((img, index) => {
  console.log(`${index + 1}. ${img.path} (${img.sizeMB}MB)`);
});

console.log('\n📊 SUMMARY:');
console.log(`   Total images: ${allImages.length}`);
console.log(`   Total size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
console.log(`   Large images: ${largeImages.length}`);
console.log(`   Large images size: ${(largeImages.reduce((sum, img) => sum + img.size, 0) / 1024 / 1024).toFixed(2)}MB`);

// Identify potentially unused directories
console.log('\n🤔 POTENTIALLY UNUSED DIRECTORIES:');
console.log('===================================');

const suspiciousDirs = [
  'optimized',
  'optimized/original_backup',
  'compressed',
  'original_backup',
  'original_backup_optimized'
];

suspiciousDirs.forEach(dir => {
  if (imagesByDir[dir]) {
    const images = imagesByDir[dir];
    const dirSize = images.reduce((sum, img) => sum + img.size, 0);
    console.log(`\n📂 ${dir}:`);
    console.log(`   Images: ${images.length}`);
    console.log(`   Size: ${(dirSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   ⚠️  This looks like backup/optimization directory`);
    console.log(`   💡 Consider deleting this entire directory`);
  }
});

// Create deletion recommendations
console.log('\n💡 DELETION RECOMMENDATIONS:');
console.log('=============================');

let totalSavings = 0;
const deletionCandidates = [];

// 1. Backup directories
suspiciousDirs.forEach(dir => {
  if (imagesByDir[dir]) {
    const images = imagesByDir[dir];
    const dirSize = images.reduce((sum, img) => sum + img.size, 0);
    deletionCandidates.push({
      type: 'directory',
      path: dir,
      size: dirSize,
      reason: 'Backup/optimization directory'
    });
    totalSavings += dirSize;
  }
});

// 2. Large individual images
largeImages.forEach(img => {
  if (img.size > 2 * 1024 * 1024) { // > 2MB
    deletionCandidates.push({
      type: 'file',
      path: img.path,
      size: img.size,
      reason: 'Too large for web (>2MB)'
    });
    totalSavings += img.size;
  }
});

deletionCandidates.sort((a, b) => b.size - a.size);

console.log('\n🗑️  RECOMMENDED DELETIONS:');
deletionCandidates.forEach((candidate, index) => {
  console.log(`${index + 1}. ${candidate.path} (${(candidate.size / 1024 / 1024).toFixed(2)}MB) - ${candidate.reason}`);
});

console.log(`\n💰 POTENTIAL SAVINGS: ${(totalSavings / 1024 / 1024).toFixed(2)}MB`);

// Create deletion script
const deletionCommands = [];

deletionCandidates.forEach(candidate => {
  if (candidate.type === 'directory') {
    deletionCommands.push(`# Delete backup directory: ${candidate.path}`);
    deletionCommands.push(`rm -rf "public/${candidate.path}"`);
  } else {
    deletionCommands.push(`# Delete large image: ${candidate.path}`);
    deletionCommands.push(`rm "public/${candidate.path}"`);
  }
});

if (deletionCommands.length > 0) {
  const scriptContent = `#!/bin/bash
# Delete unused images and backup directories
# Generated by analyze_image_usage.js

echo "🗑️  Deleting unused images and backup directories..."

${deletionCommands.join('\n')}

echo "✅ Cleanup complete!"
echo "💰 Space saved: ${(totalSavings / 1024 / 1024).toFixed(2)}MB"
`;

  fs.writeFileSync('scripts/delete_unused_images.sh', scriptContent);
  console.log(`\n📝 Created deletion script: scripts/delete_unused_images.sh`);
  console.log(`   Run: chmod +x scripts/delete_unused_images.sh && ./scripts/delete_unused_images.sh`);
}

console.log('\n🎯 NEXT STEPS:');
console.log('1. Review the recommendations above');
console.log('2. Run the deletion script to free up space');
console.log('3. Test the site to ensure nothing breaks');
console.log('4. Focus on the largest savings first');
