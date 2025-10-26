// scripts/bulk_rename_images.js
// Bulk rename images in ImageKit to match product names

import dotenv from 'dotenv';
import ImageKit from 'imagekit';

dotenv.config();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.VITE_IMAGEKIT_URL_ENDPOINT
});

// Mapping of current image names to new product names
const RENAME_MAPPING = {
  // Example mappings - you'll need to fill this with your actual mappings
  'Crax Curls Yellow.jpeg': 'CRAX NATKHAT CLASSIC.jpg',
  'Crax Curls Blue.jpeg': 'CRAX NATKHAT MASALA.jpg',
  'Bingo Mad Angles Masala.webp': 'BINGO MAD ANGLES RED ALERT.jpg',
  'Fanta 500ml.jpeg': 'FANTA.jpg',
  'Thumbs Up.webp': 'THUMS UP.jpg',
  'Monster Ultra Watermelon.jpeg': 'MONSTER WHITE ULTRA.jpg',
  'Limca 750ml.jpeg': 'LIMCA.jpg',
  'Sprite.jpeg': 'SPRITE.jpg',
  'Coca Cola 750ml.webp': 'Coca Cola.jpg',
  'Coca Cola Can 300ml.jpeg': 'Coca Cola Can 300ml.jpg',
  'Coca Cola Diet.jpeg': 'Coca Cola Diet.jpg',
  'Coca Cola Zero Sugar 750ml.webp': 'Coca Cola Zero Sugar 750ml.jpg',
  'Coca Cola Zero Sugar Can 300ml.jpeg': 'Coca Cola Zero Sugar Can 300ml.jpg',
  'Fanta 500ml.jpeg': 'FANTA.jpg',
  'Fanta 500ml.jpeg': 'FANTA (300ML).jpg',
  'Limca 750ml.jpeg': 'LIMCA.jpg',
  'Mazza.jpeg': 'MAZZA.jpg',
  'Mazza (LARGE).jpeg': 'MAZZA (LARGE).jpg',
  'Mirinda.jpeg': 'MIRINDA.jpg',
  'Mirinda (LARGE).jpeg': 'MIRINDA (LARGE).jpg',
  'Monster Green.jpeg': 'MONSTER GREEN.jpg',
  'Monster White Ultra.jpeg': 'MONSTER WHITE ULTRA.jpg',
  'Numb.jpeg': 'NUMBOOZ.jpg',
  'Orange Pulpy.jpeg': 'ORANGE PULPY.jpg',
  'Pepsi.jpeg': 'PEPSI.jpg',
  'Predator.jpeg': 'PREDATOR.jpg',
  'Slice.jpeg': 'SLICE.jpg',
  'Slice (LARGE).jpeg': 'SLICE (LARGE).jpg',
  'Sprite 750ml.webp': 'SPRITE.jpg',
  'Sprite 300ml.jpeg': 'SPRITE (300ML).jpg',
  'Sprite (LARGE).jpeg': 'SPRITE (LARGE).jpg',
  'Swing Coconut Water.jpeg': 'SWING COCONUT WATER.jpg',
  'Swing Guava.jpeg': 'SWING GUAVA.jpg',
  'Swing Lychee.jpeg': 'SWING LYCHEE.jpg',
  'Swing Lychee Premium.jpeg': 'SWING LYCHEE PREMIUM.jpg',
  'Swing Mango.jpeg': 'SWING MANGO.jpg',
  'Swing Mixed Fruit.jpeg': 'SWING MIXED FRUIT.jpg',
  'Swing Pomegranate.jpeg': 'SWING POMEGRANATE.jpg',
  'Swing Pomegranate Premium.jpeg': 'SWING POMEGRANATE PREMIUM.jpg',
  'Thums Up.jpeg': 'THUMS UP.jpg',
  'Thums Up 300ml.jpeg': 'THUMS UP (300ML).jpg',
  'Thums Up (LARGE).jpeg': 'THUMS UP (LARGE).jpg',
  'Tropicana Guava.jpeg': 'TROPICANA GAVAWA.jpg',
  'Tropicana Mixed Fruit.jpeg': 'TROPICANA MIXFURIT.jpg',
  'Zero Green Apple.jpeg': 'ZERO GREEN APPLE.jpg',
  'Zero Lemon Lime.jpeg': 'ZERO LEMON LIME.jpg'
};

async function bulkRenameImages() {
  try {
    console.log('🔄 Starting bulk rename process...\n');
    
    // Get all images from Grocery/Products folder
    const { data: images, error } = await imagekit.listFiles({
      path: '/Grocery/Products/',
      limit: 1000
    });
    
    if (error) {
      console.error('❌ Error fetching images:', error);
      return;
    }
    
    if (!images || images.length === 0) {
      console.log('❌ No images found in Grocery/Products/');
      return;
    }
    
    console.log(`📁 Found ${images.length} images to process\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const image of images) {
      const currentName = image.name;
      const newName = RENAME_MAPPING[currentName];
      
      if (newName) {
        try {
          // Rename the file
          await imagekit.renameFile({
            fileId: image.fileId,
            newFileName: newName
          });
          
          console.log(`✅ Renamed: ${currentName} → ${newName}`);
          successCount++;
        } catch (renameError) {
          console.error(`❌ Failed to rename ${currentName}:`, renameError.message);
          errorCount++;
        }
      } else {
        console.log(`⚠️  No mapping found for: ${currentName}`);
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`✅ Successfully renamed: ${successCount}`);
    console.log(`❌ Failed to rename: ${errorCount}`);
    console.log(`⚠️  No mapping found: ${images.length - successCount - errorCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Uncomment the line below to run the bulk rename
// bulkRenameImages();

console.log('🔧 Bulk rename script ready!');
console.log('📝 To use this script:');
console.log('1. Fill in the RENAME_MAPPING object with your actual mappings');
console.log('2. Uncomment the last line: bulkRenameImages();');
console.log('3. Run: node scripts/bulk_rename_images.js');
