#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔄 EXECUTING IMAGE RENAME PLAN');
console.log('=' .repeat(60));

// Read the rename plan
const planFile = path.join(__dirname, 'image_rename_plan.json');

if (!fs.existsSync(planFile)) {
  console.error('❌ No rename plan found. Run process_grocery_images.js first.');
  process.exit(1);
}

const renamePlan = JSON.parse(fs.readFileSync(planFile, 'utf8'));

console.log(`📋 Found ${renamePlan.length} files to rename`);

// Create output directory
const outputDir = path.join(__dirname, '..', 'renamed_images');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`📁 Created output directory: ${outputDir}`);
}

let successCount = 0;
let errorCount = 0;

console.log('\n🔄 RENAMING FILES:');
console.log('-' .repeat(60));

for (const item of renamePlan) {
  try {
    // Copy file to output directory with new name
    const outputPath = path.join(outputDir, item.newName);
    
    // Copy the file
    fs.copyFileSync(item.originalPath, outputPath);
    
    console.log(`✅ ${item.originalName} → ${item.newName}`);
    successCount++;
    
  } catch (error) {
    console.error(`❌ Error renaming ${item.originalName}:`, error.message);
    errorCount++;
  }
}

console.log('\n📊 RENAME SUMMARY:');
console.log(`✅ Successfully renamed: ${successCount} files`);
console.log(`❌ Errors: ${errorCount} files`);
console.log(`📁 Output directory: ${outputDir}`);

if (successCount > 0) {
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Review the renamed files in the output directory');
  console.log('2. Run: node scripts/upload_to_imagekit.js');
  console.log('3. Delete the product images folder after successful upload');
}
