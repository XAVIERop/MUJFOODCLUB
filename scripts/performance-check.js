const fs = require('fs');
const path = require('path');

console.log('🔍 Performance Check');
console.log('==================');

// Check bundle size
const distDir = 'dist';
if (fs.existsSync(distDir)) {
  const files = fs.readdirSync(distDir, { recursive: true });
  let totalSize = 0;
  
  files.forEach(file => {
    const filePath = path.join(distDir, file);
    if (fs.statSync(filePath).isFile()) {
      totalSize += fs.statSync(filePath).size;
    }
  });
  
  console.log(`📦 Total bundle size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
  
  if (totalSize > 5 * 1024 * 1024) {
    console.log('⚠️  Bundle size is large (>5MB)');
  } else {
    console.log('✅ Bundle size is reasonable');
  }
} else {
  console.log('❌ No dist folder found. Run "npm run build" first.');
}

// Check for large images
const publicDir = 'public';
let imageSize = 0;
let imageCount = 0;

function scanImages(dir) {
  if (!fs.existsSync(dir)) return;
  
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      scanImages(fullPath);
    } else if (/\.(png|jpg|jpeg|webp)$/i.test(item)) {
      imageSize += stat.size;
      imageCount++;
    }
  });
}

scanImages(publicDir);

console.log(`🖼️  Images: ${imageCount} files, ${(imageSize / 1024 / 1024).toFixed(2)}MB`);

if (imageSize > 10 * 1024 * 1024) {
  console.log('⚠️  Large image assets detected');
} else {
  console.log('✅ Image assets are reasonable');
}
