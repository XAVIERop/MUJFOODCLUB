#!/usr/bin/env node

import ImageKit from 'imagekit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

console.log('☁️  UPLOADING IMAGES TO IMAGEKIT');
console.log('=' .repeat(60));

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.VITE_IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.VITE_IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.VITE_IMAGEKIT_URL_ENDPOINT
});

// Check if ImageKit is configured
if (!process.env.VITE_IMAGEKIT_PUBLIC_KEY || !process.env.VITE_IMAGEKIT_PRIVATE_KEY || !process.env.VITE_IMAGEKIT_URL_ENDPOINT) {
  console.error('❌ ImageKit not configured. Please set environment variables:');
  console.error('   VITE_IMAGEKIT_PUBLIC_KEY');
  console.error('   VITE_IMAGEKIT_PRIVATE_KEY');
  console.error('   VITE_IMAGEKIT_URL_ENDPOINT');
  process.exit(1);
}

const renamedImagesDir = path.join(__dirname, '..', 'renamed_images');

if (!fs.existsSync(renamedImagesDir)) {
  console.error('❌ No renamed images directory found. Run execute_image_rename.js first.');
  process.exit(1);
}

// Get all renamed images
const renamedImages = fs.readdirSync(renamedImagesDir)
  .filter(file => /\.(jpg|jpeg|png|webp|avif)$/i.test(file));

console.log(`📋 Found ${renamedImages.length} images to upload`);

let successCount = 0;
let errorCount = 0;

console.log('\n☁️  UPLOADING TO IMAGEKIT:');
console.log('-' .repeat(60));

for (const imageFile of renamedImages) {
  try {
    const imagePath = path.join(renamedImagesDir, imageFile);
    const imageBuffer = fs.readFileSync(imagePath);
    
    // Upload to ImageKit
    const result = await imagekit.upload({
      file: imageBuffer,
      fileName: imageFile,
      folder: '/Grocery/Products/',
      useUniqueFileName: false, // Use exact filename
      overwriteFile: true // Overwrite if exists
    });
    
    console.log(`✅ ${imageFile} → ${result.url}`);
    successCount++;
    
  } catch (error) {
    console.error(`❌ Error uploading ${imageFile}:`, error.message);
    errorCount++;
  }
}

console.log('\n📊 UPLOAD SUMMARY:');
console.log(`✅ Successfully uploaded: ${successCount} images`);
console.log(`❌ Errors: ${errorCount} images`);

if (successCount > 0) {
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Test your grocery page to see if images load correctly');
  console.log('2. Delete the product images folder');
  console.log('3. Delete the renamed_images folder');
  console.log('4. Check browser console for ✅ and ❌ messages');
}

console.log('\n✨ ImageKit upload complete!');