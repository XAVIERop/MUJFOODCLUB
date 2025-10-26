#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

console.log('🖼️  GROCERY IMAGE PROCESSING SCRIPT');
console.log('=' .repeat(60));

// Get all grocery products from database
async function getGroceryProducts() {
  console.log('📋 Fetching grocery products from database...');
  
  const { data: cafeData } = await supabase
    .from('cafes')
    .select('id')
    .ilike('name', '%24 seven mart%')
    .single();
    
  const { data: products } = await supabase
    .from('menu_items')
    .select('name')
    .eq('cafe_id', cafeData.id)
    .order('name');
    
  console.log(`✅ Found ${products.length} products in database`);
  return products.map(p => p.name);
}

// Scan all images in the product images folder
function scanAllImages() {
  console.log('🔍 Scanning all images in product images folder...');
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];
  const images = [];
  
  function scanDirectory(dirPath, relativePath = '') {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const relativeItemPath = relativePath ? path.join(relativePath, item) : item;
      
      if (fs.statSync(fullPath).isDirectory()) {
        // Recursively scan subdirectories
        scanDirectory(fullPath, relativeItemPath);
      } else {
        // Check if it's an image file
        const ext = path.extname(item).toLowerCase();
        if (imageExtensions.includes(ext)) {
          images.push({
            originalPath: fullPath,
            relativePath: relativeItemPath,
            fileName: item,
            nameWithoutExt: path.basename(item, ext),
            extension: ext
          });
        }
      }
    }
  }
  
  const productImagesDir = path.join(__dirname, '..', 'product images');
  scanDirectory(productImagesDir);
  
  console.log(`✅ Found ${images.length} images total`);
  return images;
}

// Fuzzy matching function to match image names to product names
function findBestMatch(imageName, productNames) {
  const imageLower = imageName.toLowerCase();
  
  // Try exact match first
  for (const product of productNames) {
    if (imageLower === product.toLowerCase()) {
      return { product, confidence: 100, reason: 'exact' };
    }
  }
  
  // Try partial matches
  const matches = [];
  
  for (const product of productNames) {
    const productLower = product.toLowerCase();
    
    // Check if image name contains product name or vice versa
    if (imageLower.includes(productLower) || productLower.includes(imageLower)) {
      const confidence = Math.min(imageLower.length, productLower.length) / Math.max(imageLower.length, productLower.length) * 100;
      matches.push({ product, confidence, reason: 'contains' });
    }
    
    // Check for word overlap
    const imageWords = imageLower.split(/[\s\-_]+/);
    const productWords = productLower.split(/[\s\-_]+/);
    
    let wordMatches = 0;
    for (const imageWord of imageWords) {
      for (const productWord of productWords) {
        if (imageWord === productWord && imageWord.length > 2) {
          wordMatches++;
          break;
        }
      }
    }
    
    if (wordMatches > 0) {
      const confidence = (wordMatches / Math.max(imageWords.length, productWords.length)) * 100;
      matches.push({ product, confidence, reason: 'words' });
    }
  }
  
  // Return best match
  if (matches.length > 0) {
    matches.sort((a, b) => b.confidence - a.confidence);
    return matches[0];
  }
  
  return null;
}

// Main processing function
async function processImages() {
  try {
    // Get products and images
    const productNames = await getGroceryProducts();
    const images = scanAllImages();
    
    console.log('\n🔗 MATCHING IMAGES TO PRODUCTS:');
    console.log('-' .repeat(60));
    
    const matches = [];
    const unmatched = [];
    
    for (const image of images) {
      const match = findBestMatch(image.nameWithoutExt, productNames);
      
      if (match && match.confidence > 50) {
        matches.push({
          ...image,
          matchedProduct: match.product,
          confidence: match.confidence,
          reason: match.reason
        });
        
        console.log(`✅ ${image.fileName} → ${match.product} (${match.confidence.toFixed(1)}% - ${match.reason})`);
      } else {
        unmatched.push(image);
        console.log(`❌ ${image.fileName} → No good match found`);
      }
    }
    
    console.log('\n📊 SUMMARY:');
    console.log(`✅ Matched: ${matches.length} images`);
    console.log(`❌ Unmatched: ${unmatched.length} images`);
    
    // Generate renaming plan
    console.log('\n📝 RENAMING PLAN:');
    console.log('-' .repeat(60));
    
    const renamePlan = [];
    for (const match of matches) {
      const newFileName = `${match.matchedProduct}.webp`;
      renamePlan.push({
        originalPath: match.originalPath,
        originalName: match.fileName,
        newName: newFileName,
        product: match.matchedProduct,
        confidence: match.confidence
      });
      
      console.log(`📦 ${match.fileName} → ${newFileName}`);
    }
    
    // Save plan to file
    const planFile = path.join(__dirname, 'image_rename_plan.json');
    fs.writeFileSync(planFile, JSON.stringify(renamePlan, null, 2));
    console.log(`\n💾 Rename plan saved to: ${planFile}`);
    
    // Show unmatched images
    if (unmatched.length > 0) {
      console.log('\n❌ UNMATCHED IMAGES (need manual review):');
      console.log('-' .repeat(60));
      unmatched.forEach(img => {
        console.log(`📁 ${img.relativePath}`);
      });
    }
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Review the matches above');
    console.log('2. Check unmatched images manually');
    console.log('3. Run: node scripts/execute_image_rename.js (to actually rename)');
    console.log('4. Run: node scripts/upload_to_imagekit.js (to upload to ImageKit)');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the processing
processImages();
