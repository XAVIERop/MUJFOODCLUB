/**
 * Upload Images from Backup Folder to ImageKit
 * This script uploads images from the backup folder created during cleanup
 */

import ImageKit from 'imagekit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function uploadImage(filePath, fileName) {
  try {
    const file = fs.readFileSync(filePath);
    
    const result = await imagekit.upload({
      file: file,
      fileName: fileName,
      folder: '/',
      useUniqueFileName: false,
      tags: ['muj-food-club', 'production']
    });
    
    return {
      success: true,
      fileId: result.fileId,
      url: result.url,
      fileName: result.name
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      fileName: fileName
    };
  }
}

async function findAndUploadImages() {
  console.log('🚀 Uploading Images from Backup Folder');
  console.log('======================================\n');
  
  // Check credentials
  if (!process.env.VITE_IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY) {
    console.error('❌ Missing ImageKit credentials');
    return;
  }
  
  const imagekit = new ImageKit({
    publicKey: process.env.VITE_IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.VITE_IMAGEKIT_URL_ENDPOINT
  });
  
  const publicDir = path.join(__dirname, '..', 'public');
  const backupDir = path.join(publicDir, 'original_backup');
  const results = [];
  let successCount = 0;
  let errorCount = 0;
  
  // Find all image files in backup folder
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.svg', '.webp', '.pdf'];
  const allFiles = [];
  
  function scanDirectory(dir, relativePath = '') {
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const relativeFilePath = path.join(relativePath, file);
        
        if (fs.statSync(fullPath).isDirectory()) {
          scanDirectory(fullPath, relativeFilePath);
        } else {
          const ext = path.extname(file).toLowerCase();
          if (imageExtensions.includes(ext)) {
            allFiles.push({
              fullPath,
              fileName: file,
              relativePath: relativeFilePath
            });
          }
        }
      }
    } catch (error) {
      console.log(`⚠️  Could not scan ${dir}: ${error.message}`);
    }
  }
  
  // Scan both main public folder and backup folder
  scanDirectory(publicDir);
  if (fs.existsSync(backupDir)) {
    scanDirectory(backupDir);
  }
  
  console.log(`📁 Found ${allFiles.length} image files to upload\n`);
  
  for (let i = 0; i < allFiles.length; i++) {
    const { fullPath, fileName } = allFiles[i];
    
    console.log(`📤 [${i + 1}/${allFiles.length}] Uploading ${fileName}...`);
    
    try {
      const file = fs.readFileSync(fullPath);
      
      const result = await imagekit.upload({
        file: file,
        fileName: fileName,
        folder: '/',
        useUniqueFileName: false,
        tags: ['muj-food-club', 'production']
      });
      
      console.log(`✅ Success: ${result.url}`);
      results.push({
        success: true,
        fileId: result.fileId,
        url: result.url,
        fileName: result.name
      });
      successCount++;
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      results.push({
        success: false,
        error: error.message,
        fileName: fileName
      });
      errorCount++;
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Save results
  const resultsFile = path.join(__dirname, 'imagekit_backup_upload_results.json');
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
  
  console.log('\n🎉 Upload Complete!');
  console.log('==================');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`📄 Results: ${resultsFile}`);
  
  if (successCount > 0) {
    console.log('\n🎯 Next Steps:');
    console.log('1. Check ImageKit dashboard: https://imagekit.io/dashboard/media-library');
    console.log('2. Verify all images are uploaded correctly');
    console.log('3. Plan component migration strategy');
  }
}

findAndUploadImages().catch(console.error);
