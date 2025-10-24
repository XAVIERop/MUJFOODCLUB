#!/usr/bin/env node

/**
 * Find Unused Images Script
 * Identifies images that are not referenced anywhere in the codebase
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 FINDING UNUSED IMAGES');
console.log('========================\n');

// Get all image files
const publicDir = 'public';
const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];
const allImages = [];

function scanForImages(dir, relativePath = '') {
  if (!fs.existsSync(dir)) return;
  
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && item !== 'node_modules' && item !== 'dist') {
      scanForImages(fullPath, path.join(relativePath, item));
    } else if (imageExtensions.some(ext => item.toLowerCase().endsWith(ext))) {
      const imagePath = path.join(relativePath, item);
      const size = stat.size;
      allImages.push({
        path: imagePath,
        fullPath: fullPath,
        size: size,
        sizeMB: (size / 1024 / 1024).toFixed(2)
      });
    }
  });
}

console.log('📁 Scanning for images...');
scanForImages(publicDir);

console.log(`Found ${allImages.length} images total\n`);

// Get all source files that might reference images
const srcDir = 'src';
const sourceFiles = [];

function scanForSourceFiles(dir, relativePath = '') {
  if (!fs.existsSync(dir)) return;
  
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && item !== 'node_modules') {
      scanForSourceFiles(fullPath, path.join(relativePath, item));
    } else if (/\.(tsx?|jsx?|css|html)$/.test(item)) {
      sourceFiles.push(fullPath);
    }
  });
}

console.log('📄 Scanning source files...');
scanForSourceFiles(srcDir);
scanForSourceFiles('.'); // Also check root files like index.html

console.log(`Found ${sourceFiles.length} source files\n`);

// Check which images are referenced
const usedImages = new Set();
const unusedImages = [];

console.log('🔍 Checking image usage...\n');

allImages.forEach(image => {
  const imageName = path.basename(image.path);
  const imageNameWithoutExt = path.basename(image.path, path.extname(image.path));
  let isUsed = false;
  
  // Check if image is referenced in any source file
  for (const sourceFile of sourceFiles) {
    try {
      const content = fs.readFileSync(sourceFile, 'utf8');
      
      // Check for various ways images might be referenced
      if (
        content.includes(imageName) ||
        content.includes(imageNameWithoutExt) ||
        content.includes(`/${image.path}`) ||
        content.includes(`"${image.path}"`) ||
        content.includes(`'${image.path}'`) ||
        content.includes(`/${imageName}`) ||
        content.includes(`"${imageName}"`) ||
        content.includes(`'${imageName}'`)
      ) {
        isUsed = true;
        usedImages.add(image.path);
        break;
      }
    } catch (error) {
      // Skip files that can't be read
    }
  }
  
  if (!isUsed) {
    unusedImages.push(image);
  }
});

// Sort unused images by size (largest first)
unusedImages.sort((a, b) => b.size - a.size);

console.log('📊 RESULTS:');
console.log(`   Total images: ${allImages.length}`);
console.log(`   Used images: ${usedImages.size}`);
console.log(`   Unused images: ${unusedImages.length}`);
console.log(`   Unused size: ${(unusedImages.reduce((sum, img) => sum + img.size, 0) / 1024 / 1024).toFixed(2)}MB\n`);

if (unusedImages.length > 0) {
  console.log('🗑️  UNUSED IMAGES (largest first):');
  console.log('=====================================');
  
  unusedImages.forEach((image, index) => {
    console.log(`${index + 1}. ${image.path} (${image.sizeMB}MB)`);
  });
  
  console.log(`\n💡 RECOMMENDATIONS:`);
  console.log(`1. Delete all unused images to save space`);
  console.log(`2. Focus on the largest unused images first`);
  console.log(`3. Double-check before deleting`);
  
  // Create deletion script
  const deletionScript = unusedImages.map(img => 
    `rm "${img.fullPath}"`
  ).join('\n');
  
  fs.writeFileSync('scripts/delete_unused_images.sh', `#!/bin/bash\n# Delete unused images\n${deletionScript}\n`);
  
  console.log(`\n📝 Created deletion script: scripts/delete_unused_images.sh`);
  console.log(`   Run: chmod +x scripts/delete_unused_images.sh && ./scripts/delete_unused_images.sh`);
  
} else {
  console.log('✅ All images appear to be in use!');
}

console.log('\n🎯 NEXT STEPS:');
console.log('1. Review the unused images list above');
console.log('2. Run the deletion script to remove them');
console.log('3. Test the site to ensure nothing breaks');
console.log('4. Check if images are referenced dynamically (not caught by this scan)');
