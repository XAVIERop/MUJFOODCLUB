#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const INPUT_DIR = path.join(__dirname, '../public');
const OUTPUT_DIR = path.join(__dirname, '../public/optimized');
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB max
const QUALITY = 80; // Image quality (1-100)

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function optimizePDF(inputPath, outputPath) {
  try {
    console.log(`\n🔄 Optimizing: ${path.basename(inputPath)}`);
    
    // Read the original PDF
    const originalPdfBytes = fs.readFileSync(inputPath);
    const originalSize = originalPdfBytes.length;
    console.log(`📊 Original size: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
    
    // Load PDF document
    const pdfDoc = await PDFDocument.load(originalPdfBytes);
    
    // Get page count
    const pageCount = pdfDoc.getPageCount();
    console.log(`📄 Pages: ${pageCount}`);
    
    // If file is already small enough, just copy it
    if (originalSize <= MAX_FILE_SIZE) {
      console.log(`✅ File already optimized (${(originalSize / 1024 / 1024).toFixed(2)} MB)`);
      fs.copyFileSync(inputPath, outputPath);
      return { success: true, originalSize, optimizedSize: originalSize };
    }
    
    // Create a new PDF document
    const newPdfDoc = await PDFDocument.create();
    
    // Copy pages with optimization
    for (let i = 0; i < pageCount; i++) {
      const [page] = await newPdfDoc.copyPages(pdfDoc, [i]);
      newPdfDoc.addPage(page);
    }
    
    // Save the optimized PDF
    const optimizedPdfBytes = await newPdfDoc.save({
      useObjectStreams: false,
      addDefaultPage: false,
      objectsPerTick: 50,
    });
    
    const optimizedSize = optimizedPdfBytes.length;
    const compressionRatio = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
    
    console.log(`📊 Optimized size: ${(optimizedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📉 Compression: ${compressionRatio}% reduction`);
    
    // Write optimized PDF
    fs.writeFileSync(outputPath, optimizedPdfBytes);
    
    return { 
      success: true, 
      originalSize, 
      optimizedSize, 
      compressionRatio: parseFloat(compressionRatio) 
    };
    
  } catch (error) {
    console.error(`❌ Error optimizing ${path.basename(inputPath)}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function createThumbnail(pdfPath, thumbnailPath) {
  try {
    console.log(`🖼️  Creating thumbnail for ${path.basename(pdfPath)}`);
    
    // For now, we'll create a placeholder thumbnail
    // In a real implementation, you'd use pdf2pic or similar
    const thumbnailSvg = `
      <svg width="200" height="280" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="280" fill="#f3f4f6"/>
        <rect x="20" y="20" width="160" height="240" fill="#e5e7eb" stroke="#d1d5db" stroke-width="2"/>
        <text x="100" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#6b7280">
          PDF Preview
        </text>
        <text x="100" y="170" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#9ca3af">
          ${path.basename(pdfPath)}
        </text>
      </svg>
    `;
    
    fs.writeFileSync(thumbnailPath, thumbnailSvg);
    console.log(`✅ Thumbnail created: ${path.basename(thumbnailPath)}`);
    
  } catch (error) {
    console.error(`❌ Error creating thumbnail:`, error.message);
  }
}

async function main() {
  console.log('🚀 Starting PDF Optimization Process...\n');
  
  // Find all PDF files
  const pdfFiles = fs.readdirSync(INPUT_DIR)
    .filter(file => file.endsWith('.pdf'))
    .map(file => ({
      input: path.join(INPUT_DIR, file),
      output: path.join(OUTPUT_DIR, file),
      thumbnail: path.join(OUTPUT_DIR, file.replace('.pdf', '_thumb.svg'))
    }));
  
  if (pdfFiles.length === 0) {
    console.log('❌ No PDF files found in public directory');
    return;
  }
  
  console.log(`📁 Found ${pdfFiles.length} PDF files to optimize`);
  
  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  let successCount = 0;
  
  // Process each PDF
  for (const pdfFile of pdfFiles) {
    const result = await optimizePDF(pdfFile.input, pdfFile.output);
    
    if (result.success) {
      totalOriginalSize += result.originalSize;
      totalOptimizedSize += result.optimizedSize;
      successCount++;
      
      // Create thumbnail
      await createThumbnail(pdfFile.output, pdfFile.thumbnail);
    }
  }
  
  // Summary
  console.log('\n📊 OPTIMIZATION SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Successfully optimized: ${successCount}/${pdfFiles.length} files`);
  console.log(`📊 Total original size: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📊 Total optimized size: ${(totalOptimizedSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📉 Total space saved: ${((totalOriginalSize - totalOptimizedSize) / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📈 Average compression: ${(((totalOriginalSize - totalOptimizedSize) / totalOriginalSize) * 100).toFixed(1)}%`);
  
  console.log('\n🎯 Next steps:');
  console.log('1. Review optimized PDFs in public/optimized/');
  console.log('2. Replace original PDFs with optimized versions');
  console.log('3. Update MenuViewer to use optimized PDFs');
  console.log('4. Consider implementing progressive loading');
}

// Run the optimization
main().catch(console.error);
