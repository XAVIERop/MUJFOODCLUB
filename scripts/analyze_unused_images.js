#!/usr/bin/env node

/**
 * Script to identify unused images in the public folder
 * Run: node scripts/analyze_unused_images.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all image files from public folder
const publicDir = path.join(__dirname, '../public');
const srcDir = path.join(__dirname, '../src');

// Image extensions to check
const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];

// Function to get all files recursively
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

// Get all image files from public
const allPublicFiles = getAllFiles(publicDir);
const allImages = allPublicFiles
  .filter(file => imageExtensions.some(ext => file.toLowerCase().endsWith(ext)))
  .map(file => file.replace(publicDir, ''));

console.log(`\n📊 Total images in /public: ${allImages.length}\n`);

// Get all source files
const allSrcFiles = getAllFiles(srcDir);
const sourceCode = allSrcFiles
  .filter(file => file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js'))
  .map(file => fs.readFileSync(file, 'utf8'))
  .join('\n');

// Check which images are referenced
const usedImages = [];
const unusedImages = [];

allImages.forEach(image => {
  const imageName = path.basename(image);
  // Check if image name appears in source code
  if (sourceCode.includes(imageName)) {
    usedImages.push(image);
  } else {
    unusedImages.push(image);
  }
});

console.log(`✅ Images currently in use: ${usedImages.length}`);
console.log(`❌ Unused images: ${unusedImages.length}\n`);

// Show used images
console.log('━'.repeat(60));
console.log('✅ USED IMAGES:');
console.log('━'.repeat(60));
usedImages.sort().forEach(img => console.log(`  ${img}`));

console.log('\n');
console.log('━'.repeat(60));
console.log('❌ UNUSED IMAGES (Safe to delete):');
console.log('━'.repeat(60));
unusedImages.sort().forEach(img => console.log(`  ${img}`));

console.log('\n');
console.log('━'.repeat(60));
console.log('📁 BREAKDOWN BY FOLDER:');
console.log('━'.repeat(60));

// Group unused images by folder
const folderMap = {};
unusedImages.forEach(img => {
  const folder = path.dirname(img).split(path.sep)[1] || 'root';
  if (!folderMap[folder]) folderMap[folder] = [];
  folderMap[folder].push(img);
});

Object.keys(folderMap).sort().forEach(folder => {
  console.log(`\n  ${folder}/ (${folderMap[folder].length} files)`);
});

console.log('\n');
console.log('━'.repeat(60));
console.log('💾 ESTIMATED SPACE SAVINGS:');
console.log('━'.repeat(60));

let totalSize = 0;
unusedImages.forEach(img => {
  const filePath = path.join(publicDir, img);
  if (fs.existsSync(filePath)) {
    totalSize += fs.statSync(filePath).size;
  }
});

const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
console.log(`  Deleting unused images will save: ${sizeMB} MB\n`);

// Save results to JSON for potential cleanup script
const results = {
  totalImages: allImages.length,
  usedImages: usedImages.length,
  unusedImages: unusedImages.length,
  unusedImagesList: unusedImages,
  totalSizeMB: parseFloat(sizeMB)
};

fs.writeFileSync(
  path.join(__dirname, 'unused_images_report.json'),
  JSON.stringify(results, null, 2)
);

console.log('📄 Full report saved to: scripts/unused_images_report.json\n');

