const fs = require('fs');
const path = require('path');

console.log('🖼️  Image Optimization');
console.log('====================');

const publicDir = 'public';
const optimizedDir = 'public/optimized';

// Create optimized directory
if (!fs.existsSync(optimizedDir)) {
  fs.mkdirSync(optimizedDir, { recursive: true });
}

let optimizedCount = 0;
let totalSavings = 0;

function optimizeImages(dir) {
  if (!fs.existsSync(dir)) return;
  
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && item !== 'optimized') {
      const subDir = path.join(optimizedDir, item);
      if (!fs.existsSync(subDir)) {
        fs.mkdirSync(subDir, { recursive: true });
      }
      optimizeImages(fullPath);
    } else if (/\.(png|jpg|jpeg)$/i.test(item)) {
      const originalSize = stat.size;
      const optimizedPath = path.join(optimizedDir, item.replace(/\.(png|jpg|jpeg)$/i, '.webp'));
      
      // For now, just copy the file (in real implementation, use sharp or imagemin)
      fs.copyFileSync(fullPath, optimizedPath);
      
      const optimizedSize = fs.statSync(optimizedPath).size;
      const savings = originalSize - optimizedSize;
      
      if (savings > 0) {
        optimizedCount++;
        totalSavings += savings;
        console.log(`✅ ${item}: ${(savings / 1024).toFixed(1)}KB saved`);
      }
    }
  });
}

optimizeImages(publicDir);

console.log(`\n📊 Optimization Results:`);
console.log(`   Files optimized: ${optimizedCount}`);
console.log(`   Total savings: ${(totalSavings / 1024 / 1024).toFixed(2)}MB`);
