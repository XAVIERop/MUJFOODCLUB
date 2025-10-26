#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧹 CLEANING UP IMAGE PROCESSING FILES');
console.log('=' .repeat(60));

const projectRoot = path.join(__dirname, '..');

// Files and folders to clean up
const cleanupItems = [
  'product images',
  'renamed_images',
  'scripts/image_rename_plan.json'
];

let cleanedCount = 0;
let errorCount = 0;

console.log('🗑️  CLEANING UP:');
console.log('-' .repeat(40));

for (const item of cleanupItems) {
  const itemPath = path.join(projectRoot, item);
  
  try {
    if (fs.existsSync(itemPath)) {
      if (fs.statSync(itemPath).isDirectory()) {
        fs.rmSync(itemPath, { recursive: true, force: true });
        console.log(`✅ Deleted folder: ${item}`);
      } else {
        fs.unlinkSync(itemPath);
        console.log(`✅ Deleted file: ${item}`);
      }
      cleanedCount++;
    } else {
      console.log(`⏭️  Not found: ${item}`);
    }
  } catch (error) {
    console.error(`❌ Error deleting ${item}:`, error.message);
    errorCount++;
  }
}

console.log('\n📊 CLEANUP SUMMARY:');
console.log(`✅ Successfully cleaned: ${cleanedCount} items`);
console.log(`❌ Errors: ${errorCount} items`);

if (cleanedCount > 0) {
  console.log('\n🎉 CLEANUP COMPLETE!');
  console.log('Your project is now clean and ready for production.');
} else {
  console.log('\n📝 Nothing to clean up.');
}

console.log('\n✨ Next: Test your grocery page to see all the new images!');
