#!/usr/bin/env node

/**
 * Automatic ImageKit Upload Script
 * Uploads all images to ImageKit using the API
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 AUTOMATIC IMAGEKIT UPLOAD');
console.log('============================\n');

// ImageKit API configuration
const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;
const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY;
const IMAGEKIT_URL_ENDPOINT = process.env.VITE_IMAGEKIT_URL_ENDPOINT;

if (!IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_PUBLIC_KEY) {
  console.log('❌ Missing ImageKit API credentials');
  console.log('   Add these to your .env file:');
  console.log('   IMAGEKIT_PRIVATE_KEY=your_private_key');
  console.log('   IMAGEKIT_PUBLIC_KEY=your_public_key');
  console.log('\n   Get these from ImageKit Dashboard → Developer Options');
  process.exit(1);
}

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

console.log(`📊 Found ${imagesToUpload.length} images to upload\n`);

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

const allImages = [...criticalImages, ...otherImages];

console.log('🎯 UPLOAD PRIORITY:');
console.log(`   Critical images: ${criticalImages.length}`);
console.log(`   Other images: ${otherImages.length}`);
console.log(`   Total: ${allImages.length}\n`);

// ImageKit upload function
async function uploadToImageKit(imagePath, fileName) {
  try {
    const fileBuffer = fs.readFileSync(imagePath);
    
    const formData = new FormData();
    formData.append('file', fileBuffer, fileName);
    formData.append('fileName', fileName);
    formData.append('useUniqueFileName', 'false');
    
    const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${IMAGEKIT_PUBLIC_KEY}:${IMAGEKIT_PRIVATE_KEY}`).toString('base64')}`
      },
      body: formData
    });
    
    if (response.ok) {
      const result = await response.json();
      return { success: true, url: result.url };
    } else {
      const error = await response.text();
      return { success: false, error };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Upload images in batches
async function uploadImages() {
  console.log('🚀 Starting upload process...\n');
  
  let successCount = 0;
  let errorCount = 0;
  const errors = [];
  
  for (let i = 0; i < allImages.length; i++) {
    const image = allImages[i];
    const progress = ((i + 1) / allImages.length * 100).toFixed(1);
    
    console.log(`📤 [${i + 1}/${allImages.length}] (${progress}%) Uploading: ${image.name} (${image.sizeMB}MB)`);
    
    const result = await uploadToImageKit(image.fullPath, image.name);
    
    if (result.success) {
      console.log(`   ✅ Success: ${result.url}`);
      successCount++;
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
      errorCount++;
      errors.push({ name: image.name, error: result.error });
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n📊 UPLOAD SUMMARY:`);
  console.log(`   Total: ${allImages.length}`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Failed: ${errorCount}`);
  
  if (errors.length > 0) {
    console.log(`\n❌ FAILED UPLOADS:`);
    errors.forEach(error => {
      console.log(`   ${error.name}: ${error.error}`);
    });
  }
  
  if (successCount > 0) {
    console.log(`\n🎉 SUCCESS! ${successCount} images uploaded to ImageKit`);
    console.log(`   Your images are now available at: ${IMAGEKIT_URL_ENDPOINT}`);
    console.log(`   Update your .env file and restart your dev server`);
  }
}

// Check if we should proceed
console.log('⚠️  WARNING: This will upload ALL images to ImageKit');
console.log('   Make sure you have the correct API credentials');
console.log('   This may take several minutes depending on image count\n');

// Uncomment the line below to start the upload process
uploadImages().catch(console.error);

console.log('💡 TO START UPLOAD:');
console.log('   1. Add ImageKit API credentials to .env');
console.log('   2. Uncomment the uploadImages() call in this script');
console.log('   3. Run: node scripts/auto_upload_to_imagekit.js');
console.log('\n🔑 REQUIRED .env VARIABLES:');
console.log('   IMAGEKIT_PRIVATE_KEY=your_private_key');
console.log('   IMAGEKIT_PUBLIC_KEY=your_public_key');
console.log('   VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/foodclub/');
