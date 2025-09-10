#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const INPUT_DIR = path.join(__dirname, '../public');
const OUTPUT_DIR = path.join(__dirname, '../public/compressed');
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB max

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function compressPDF(inputPath, outputPath) {
  try {
    console.log(`\n🔄 Compressing: ${path.basename(inputPath)}`);
    
    const originalSize = fs.statSync(inputPath).size;
    console.log(`📊 Original size: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
    
    // If file is already small enough, just copy it
    if (originalSize <= MAX_FILE_SIZE) {
      console.log(`✅ File already optimized (${(originalSize / 1024 / 1024).toFixed(2)} MB)`);
      fs.copyFileSync(inputPath, outputPath);
      return { success: true, originalSize, compressedSize: originalSize };
    }
    
    // Try different compression methods
    const methods = [
      {
        name: 'Ghostscript (High Compression)',
        command: `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -dColorImageDownsampleType=/Bicubic -dColorImageResolution=150 -dGrayImageDownsampleType=/Bicubic -dGrayImageResolution=150 -dMonoImageDownsampleType=/Bicubic -dMonoImageResolution=150 -sOutputFile="${outputPath}" "${inputPath}"`
      },
      {
        name: 'Ghostscript (Screen Quality)',
        command: `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/screen -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outputPath}" "${inputPath}"`
      }
    ];
    
    let bestResult = null;
    let bestSize = Infinity;
    
    for (const method of methods) {
      try {
        console.log(`🔧 Trying: ${method.name}`);
        execSync(method.command, { stdio: 'pipe' });
        
        if (fs.existsSync(outputPath)) {
          const compressedSize = fs.statSync(outputPath).size;
          const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
          
          console.log(`📊 Compressed size: ${(compressedSize / 1024 / 1024).toFixed(2)} MB (${compressionRatio}% reduction)`);
          
          if (compressedSize < bestSize) {
            bestSize = compressedSize;
            bestResult = {
              success: true,
              originalSize,
              compressedSize,
              compressionRatio: parseFloat(compressionRatio),
              method: method.name
            };
          }
        }
      } catch (error) {
        console.log(`❌ ${method.name} failed: ${error.message}`);
      }
    }
    
    if (bestResult) {
      console.log(`✅ Best result: ${bestResult.method} - ${(bestResult.compressedSize / 1024 / 1024).toFixed(2)} MB`);
      return bestResult;
    } else {
      console.log(`❌ All compression methods failed, copying original`);
      fs.copyFileSync(inputPath, outputPath);
      return { success: true, originalSize, compressedSize: originalSize, compressionRatio: 0 };
    }
    
  } catch (error) {
    console.error(`❌ Error compressing ${path.basename(inputPath)}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function createWebOptimizedPDF(inputPath, outputPath) {
  try {
    console.log(`\n🌐 Creating web-optimized version: ${path.basename(inputPath)}`);
    
    const originalSize = fs.statSync(inputPath).size;
    
    // Create a web-optimized version with very aggressive compression
    const command = `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/screen -dNOPAUSE -dQUIET -dBATCH -dColorImageDownsampleType=/Bicubic -dColorImageResolution=72 -dGrayImageDownsampleType=/Bicubic -dGrayImageResolution=72 -dMonoImageDownsampleType=/Bicubic -dMonoImageResolution=72 -dOptimize=true -dCompressFonts=true -dSubsetFonts=true -sOutputFile="${outputPath}" "${inputPath}"`;
    
    execSync(command, { stdio: 'pipe' });
    
    if (fs.existsSync(outputPath)) {
      const optimizedSize = fs.statSync(outputPath).size;
      const compressionRatio = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
      
      console.log(`📊 Web-optimized size: ${(optimizedSize / 1024 / 1024).toFixed(2)} MB (${compressionRatio}% reduction)`);
      
      return {
        success: true,
        originalSize,
        optimizedSize,
        compressionRatio: parseFloat(compressionRatio)
      };
    }
    
    return { success: false, error: 'Web optimization failed' };
    
  } catch (error) {
    console.error(`❌ Error creating web-optimized version:`, error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 Starting PDF Compression Process...\n');
  
  // Check if Ghostscript is available
  try {
    execSync('gs --version', { stdio: 'pipe' });
    console.log('✅ Ghostscript is available');
  } catch (error) {
    console.log('❌ Ghostscript not found. Installing via Homebrew...');
    try {
      execSync('brew install ghostscript', { stdio: 'inherit' });
      console.log('✅ Ghostscript installed successfully');
    } catch (installError) {
      console.log('❌ Failed to install Ghostscript. Please install it manually:');
      console.log('   brew install ghostscript');
      console.log('   or visit: https://www.ghostscript.com/download/gsdnld.html');
      return;
    }
  }
  
  // Find all PDF files
  const pdfFiles = fs.readdirSync(INPUT_DIR)
    .filter(file => file.endsWith('.pdf'))
    .map(file => ({
      input: path.join(INPUT_DIR, file),
      compressed: path.join(OUTPUT_DIR, file),
      webOptimized: path.join(OUTPUT_DIR, file.replace('.pdf', '_web.pdf'))
    }));
  
  if (pdfFiles.length === 0) {
    console.log('❌ No PDF files found in public directory');
    return;
  }
  
  console.log(`📁 Found ${pdfFiles.length} PDF files to compress`);
  
  let totalOriginalSize = 0;
  let totalCompressedSize = 0;
  let totalWebOptimizedSize = 0;
  let successCount = 0;
  
  // Process each PDF
  for (const pdfFile of pdfFiles) {
    const originalSize = fs.statSync(pdfFile.input).size;
    totalOriginalSize += originalSize;
    
    // Try regular compression
    const compressedResult = await compressPDF(pdfFile.input, pdfFile.compressed);
    
    // Try web optimization
    const webResult = await createWebOptimizedPDF(pdfFile.input, pdfFile.webOptimized);
    
    if (compressedResult.success) {
      totalCompressedSize += compressedResult.compressedSize;
      successCount++;
    }
    
    if (webResult.success) {
      totalWebOptimizedSize += webResult.optimizedSize;
    }
  }
  
  // Summary
  console.log('\n📊 COMPRESSION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successfully processed: ${successCount}/${pdfFiles.length} files`);
  console.log(`📊 Total original size: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📊 Total compressed size: ${(totalCompressedSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📊 Total web-optimized size: ${(totalWebOptimizedSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📉 Space saved (compressed): ${((totalOriginalSize - totalCompressedSize) / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📉 Space saved (web-optimized): ${((totalOriginalSize - totalWebOptimizedSize) / 1024 / 1024).toFixed(2)} MB`);
  
  console.log('\n🎯 Next steps:');
  console.log('1. Review compressed PDFs in public/compressed/');
  console.log('2. Use web-optimized versions for faster loading');
  console.log('3. Update MenuViewer to use compressed PDFs');
  console.log('4. Consider implementing progressive loading with thumbnails');
}

// Run the compression
main().catch(console.error);
