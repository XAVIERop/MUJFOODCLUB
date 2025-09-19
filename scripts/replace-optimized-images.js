import fs from 'fs';
import path from 'path';

function replaceOptimizedImages() {
  console.log('🔄 Replacing original images with optimized versions...\n');

  const originalDir = 'public';
  const optimizedDir = 'public/optimized_images';
  const backupDir = 'public/original_backup_optimized';

  // Create backup directory
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // Get list of optimized images
  const optimizedFiles = fs.readdirSync(optimizedDir).filter(file => 
    /\.(png|jpg|jpeg)$/i.test(file)
  );

  let replacedCount = 0;
  let totalSavings = 0;

  for (const file of optimizedFiles) {
    const originalPath = path.join(originalDir, file);
    const optimizedPath = path.join(optimizedDir, file);
    const backupPath = path.join(backupDir, file);

    if (fs.existsSync(originalPath) && fs.existsSync(optimizedPath)) {
      // Backup original
      fs.copyFileSync(originalPath, backupPath);
      
      // Get file sizes
      const originalSize = fs.statSync(originalPath).size;
      const optimizedSize = fs.statSync(optimizedPath).size;
      const savings = originalSize - optimizedSize;
      
      // Replace with optimized version
      fs.copyFileSync(optimizedPath, originalPath);
      
      console.log(`✅ ${file}: ${(originalSize/1024).toFixed(1)}KB → ${(optimizedSize/1024).toFixed(1)}KB (${(savings/1024).toFixed(1)}KB saved)`);
      
      replacedCount++;
      totalSavings += savings;
    }
  }

  console.log(`\n🎉 Replaced ${replacedCount} images`);
  console.log(`💰 Total savings: ${(totalSavings/1024).toFixed(1)}KB`);
  console.log(`📁 Originals backed up to: ${backupDir}/`);
}

replaceOptimizedImages();
