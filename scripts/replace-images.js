import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '../public');
const OPTIMIZED_DIR = path.join(__dirname, '../public/optimized');
const BACKUP_DIR = path.join(__dirname, '../public/original_backup');

// Create backup directory
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Image extensions to replace
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];

// Get file size in MB
function getFileSizeMB(filePath) {
  const stats = fs.statSync(filePath);
  return parseFloat((stats.size / (1024 * 1024)).toFixed(2));
}

// Replace images with optimized versions
async function replaceImages() {
  console.log('🔄 Starting image replacement...\n');
  
  const optimizedFiles = fs.readdirSync(OPTIMIZED_DIR);
  let replacedCount = 0;
  let totalSpaceSaved = 0;
  
  for (const optimizedFile of optimizedFiles) {
    if (!optimizedFile.endsWith('.webp')) continue;
    
    // Get original filename (remove .webp extension)
    const originalName = path.parse(optimizedFile).name;
    
    // Find original file with any extension
    const originalFiles = fs.readdirSync(PUBLIC_DIR);
    const originalFile = originalFiles.find(file => {
      const nameWithoutExt = path.parse(file).name;
      const ext = path.parse(file).ext.toLowerCase();
      return nameWithoutExt === originalName && IMAGE_EXTENSIONS.includes(ext);
    });
    
    if (!originalFile) {
      console.log(`⚠️  No original file found for ${optimizedFile}`);
      continue;
    }
    
    const originalPath = path.join(PUBLIC_DIR, originalFile);
    const optimizedPath = path.join(OPTIMIZED_DIR, optimizedFile);
    const backupPath = path.join(BACKUP_DIR, originalFile);
    
    try {
      // Get file sizes
      const originalSize = getFileSizeMB(originalPath);
      const optimizedSize = getFileSizeMB(optimizedPath);
      const spaceSaved = originalSize - optimizedSize;
      
      // Backup original file
      fs.copyFileSync(originalPath, backupPath);
      
      // Replace with optimized version
      fs.copyFileSync(optimizedPath, originalPath);
      
      console.log(`✅ ${originalFile} → ${optimizedFile} (${originalSize}MB → ${optimizedSize}MB, saved ${spaceSaved.toFixed(2)}MB)`);
      
      replacedCount++;
      totalSpaceSaved += spaceSaved;
      
    } catch (error) {
      console.error(`❌ Error replacing ${originalFile}:`, error.message);
    }
  }
  
  console.log('\n📊 REPLACEMENT SUMMARY:');
  console.log(`🔄 Images replaced: ${replacedCount}`);
  console.log(`💾 Total space saved: ${totalSpaceSaved.toFixed(2)}MB`);
  console.log(`📁 Original files backed up to: ${BACKUP_DIR}`);
  
  // Clean up optimized directory
  console.log('\n🧹 Cleaning up optimized directory...');
  fs.rmSync(OPTIMIZED_DIR, { recursive: true, force: true });
  console.log('✅ Optimized directory cleaned up');
  
  console.log('\n🎯 Next steps:');
  console.log('1. Test the application to ensure images load correctly');
  console.log('2. Update any hardcoded image paths in components');
  console.log('3. Commit the optimized images');
}

// Run replacement
replaceImages().catch(console.error);
