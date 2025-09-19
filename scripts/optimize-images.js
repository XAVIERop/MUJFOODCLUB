import imagemin from 'imagemin';
import imageminPngquant from 'imagemin-pngquant';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminWebp from 'imagemin-webp';
import fs from 'fs';
import path from 'path';

async function optimizeImages() {
  console.log('🚀 Starting image optimization...\n');

  // Create optimized directory
  const optimizedDir = 'public/optimized_images';
  if (!fs.existsSync(optimizedDir)) {
    fs.mkdirSync(optimizedDir, { recursive: true });
  }

  // Optimize PNG images
  console.log('📸 Optimizing PNG images...');
  const pngFiles = await imagemin(['public/*.png'], {
    destination: optimizedDir,
    plugins: [
      imageminPngquant({
        quality: [0.6, 0.8], // High quality but compressed
        speed: 1
      })
    ]
  });
  console.log(`✅ Optimized ${pngFiles.length} PNG files`);

  // Optimize JPG images
  console.log('📸 Optimizing JPG images...');
  const jpgFiles = await imagemin(['public/*.jpg', 'public/*.jpeg'], {
    destination: optimizedDir,
    plugins: [
      imageminMozjpeg({
        quality: 80, // Good quality with compression
        progressive: true
      })
    ]
  });
  console.log(`✅ Optimized ${jpgFiles.length} JPG files`);

  // Convert to WebP
  console.log('🌐 Converting to WebP format...');
  const webpFiles = await imagemin(['public/*.png', 'public/*.jpg', 'public/*.jpeg'], {
    destination: optimizedDir,
    plugins: [
      imageminWebp({
        quality: 80,
        method: 6 // Best compression
      })
    ]
  });
  console.log(`✅ Created ${webpFiles.length} WebP files`);

  // Show file size comparison
  console.log('\n📊 File size comparison:');
  const originalDir = 'public';
  const files = fs.readdirSync(originalDir).filter(file => 
    /\.(png|jpg|jpeg)$/i.test(file)
  );

  for (const file of files) {
    const originalPath = path.join(originalDir, file);
    const optimizedPath = path.join(optimizedDir, file);
    const webpPath = path.join(optimizedDir, file.replace(/\.(png|jpg|jpeg)$/i, '.webp'));
    
    if (fs.existsSync(originalPath)) {
      const originalSize = fs.statSync(originalPath).size;
      const optimizedSize = fs.existsSync(optimizedPath) ? fs.statSync(optimizedPath).size : originalSize;
      const webpSize = fs.existsSync(webpPath) ? fs.statSync(webpPath).size : originalSize;
      
      const originalKB = (originalSize / 1024).toFixed(1);
      const optimizedKB = (optimizedSize / 1024).toFixed(1);
      const webpKB = (webpSize / 1024).toFixed(1);
      
      const pngSavings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
      const webpSavings = ((originalSize - webpSize) / originalSize * 100).toFixed(1);
      
      console.log(`📁 ${file}:`);
      console.log(`   Original: ${originalKB}KB`);
      console.log(`   Optimized: ${optimizedKB}KB (${pngSavings}% smaller)`);
      console.log(`   WebP: ${webpKB}KB (${webpSavings}% smaller)`);
      console.log('');
    }
  }

  console.log('🎉 Image optimization complete!');
  console.log('📁 Optimized images saved to: public/optimized_images/');
  console.log('💡 Next steps:');
  console.log('   1. Review the optimized images');
  console.log('   2. Replace original images with optimized versions');
  console.log('   3. Update code to use WebP with PNG/JPG fallbacks');
}

optimizeImages().catch(console.error);