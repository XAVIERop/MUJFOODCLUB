import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '../public');
const OPTIMIZED_DIR = path.join(__dirname, '../public/optimized');

// Create optimized directory if it doesn't exist
if (!fs.existsSync(OPTIMIZED_DIR)) {
  fs.mkdirSync(OPTIMIZED_DIR, { recursive: true });
}

// Image optimization settings
const OPTIMIZATION_SETTINGS = {
  // For card images (larger, need good quality)
  card: {
    width: 400,
    height: 300,
    quality: 85,
    format: 'webp'
  },
  // For logos (smaller, need sharp quality)
  logo: {
    width: 200,
    height: 200,
    quality: 90,
    format: 'webp'
  },
  // For hero/background images (large, can be more compressed)
  hero: {
    width: 1200,
    height: 800,
    quality: 80,
    format: 'webp'
  },
  // For mobile backgrounds (very large, aggressive compression)
  mobile: {
    width: 800,
    height: 1200,
    quality: 75,
    format: 'webp'
  }
};

// Get file size in MB
function getFileSizeMB(filePath) {
  const stats = fs.statSync(filePath);
  return parseFloat((stats.size / (1024 * 1024)).toFixed(2));
}

// Determine optimization settings based on filename
function getOptimizationSettings(filename) {
  const lowerName = filename.toLowerCase();
  
  if (lowerName.includes('mobile') || lowerName.includes('bgimg')) {
    return OPTIMIZATION_SETTINGS.mobile;
  } else if (lowerName.includes('hero') || lowerName.includes('gradient')) {
    return OPTIMIZATION_SETTINGS.hero;
  } else if (lowerName.includes('card')) {
    return OPTIMIZATION_SETTINGS.card;
  } else if (lowerName.includes('logo')) {
    return OPTIMIZATION_SETTINGS.logo;
  } else {
    // Default to card settings for unknown images
    return OPTIMIZATION_SETTINGS.card;
  }
}

// Optimize a single image
async function optimizeImage(inputPath, outputPath, settings) {
  try {
    const originalSize = getFileSizeMB(inputPath);
    
    await sharp(inputPath)
      .resize(settings.width, settings.height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: settings.quality })
      .toFile(outputPath);
    
    const optimizedSize = getFileSizeMB(outputPath);
    const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
    
    console.log(`✅ ${path.basename(inputPath)}: ${originalSize}MB → ${optimizedSize}MB (${reduction}% reduction)`);
    
    return {
      original: originalSize,
      optimized: optimizedSize,
      reduction: parseFloat(reduction)
    };
  } catch (error) {
    console.error(`❌ Error optimizing ${inputPath}:`, error.message);
    return null;
  }
}

// Main optimization function
async function optimizeAllImages() {
  console.log('🚀 Starting image optimization...\n');
  
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
  const files = fs.readdirSync(PUBLIC_DIR);
  const imageFiles = files.filter(file => 
    imageExtensions.some(ext => file.toLowerCase().endsWith(ext))
  );
  
  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  let processedCount = 0;
  
  for (const file of imageFiles) {
    const inputPath = path.join(PUBLIC_DIR, file);
    const settings = getOptimizationSettings(file);
    const outputFileName = path.parse(file).name + '.webp';
    const outputPath = path.join(OPTIMIZED_DIR, outputFileName);
    
    const result = await optimizeImage(inputPath, outputPath, settings);
    
    if (result) {
      totalOriginalSize += result.original;
      totalOptimizedSize += result.optimized;
      processedCount++;
    }
  }
  
  console.log('\n📊 OPTIMIZATION SUMMARY:');
  console.log(`📁 Images processed: ${processedCount}`);
  console.log(`📏 Original total size: ${totalOriginalSize.toFixed(2)}MB`);
  console.log(`📏 Optimized total size: ${totalOptimizedSize.toFixed(2)}MB`);
  console.log(`💾 Total space saved: ${(totalOriginalSize - totalOptimizedSize).toFixed(2)}MB`);
  console.log(`📈 Average reduction: ${(((totalOriginalSize - totalOptimizedSize) / totalOriginalSize) * 100).toFixed(1)}%`);
  
  console.log('\n🎯 Next steps:');
  console.log('1. Review optimized images in /public/optimized/');
  console.log('2. Replace original images with optimized versions');
  console.log('3. Update component imports to use .webp files');
}

// Run optimization
optimizeAllImages().catch(console.error);
