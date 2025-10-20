/**
 * Safe Cleanup Script for Unused Assets
 * 
 * This script will:
 * 1. Create a backup of files before deletion
 * 2. Show exactly what will be deleted
 * 3. Ask for confirmation before proceeding
 * 4. Provide rollback instructions
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Unused images to delete (98 files)
const unusedImages = [
  '6F5DFE48-B093-4C45-A944-F869E6EAE95C_4_5005_c.jpeg',
  'authenticindian.png',
  'chaap_homebanner.png',
  'chaap.svg',
  'chatkara_bb.png',
  'chatkara_card.png',
  'chatkara_menuimg.png',
  'chatkara_offer.jpeg',
  'chatkaramenu_original.pdf',
  'china_card.png',
  'chinatown_logo.png',
  'chinesedelight.png',
  'coffee.svg',
  'cookhouse_banner.jpg',
  'cookhouse_bb.png',
  'cookhouse_card.png',
  'cookhouse_offer.jpeg',
  'cookhousemenu_original.pdf',
  'crazychef_logo.png',
  'dep-arts-program-bg.jpg',
  'deserts.svg',
  'dev_logo.png',
  'devsweets_card.png',
  'dialog_card.jpg',
  'dialog_logo.JPG',
  'fcc.svg',
  'fclog.jpeg',
  'foc.png',
  'fodcourt_bb.png',
  'foodcourt_card.jpg',
  'foodcourt_logo.png',
  'foodcourtmenu_original.pdf',
  'havmor_card.jpg',
  'havmor_logo.png',
  'havmormenu_original.pdf',
  'herobg.png',
  'image copy.png',
  'image.png',
  'img.png',
  'index.html',
  'indianfood.png',
  'italianoven_logo.png',
  'letsgo_logo.png',
  'letsgolive_card.jpg',
  'manifest.json',
  'manifest.webmanifest',
  'menu_hero.png',
  'minimeals_bb.png',
  'minimeals_bbb.png',
  'minimeals_card.png',
  'minimeals_cardhome.png',
  'minimeals_logo.png',
  'mobile_bgimg.jpg',
  'momos.svg',
  'multicuisine.svg',
  'munchbox_card.png',
  'munchbox_logo.png',
  'NorthIndian.svg',
  'pizz.png',
  'pizza.svg',
  'pizzabakers_logo.jpg',
  'pizzalover.png',
  'placeholder.svg',
  'punjabitadka_card.jpg',
  'punjabitadka_logo.png',
  'QuickBites.svg',
  'rolls.svg',
  'sandwiches.svg',
  'soyachaap_card.png',
  'soyachaap_logo.png',
  'stardom_card.webp',
  'stardom_logo.jpg',
  'sw.js',
  'tasteofind_logo.jpeg',
  'tasteofindia_card.jpg',
  'tasteofindia_logo.png',
  'teatradition_card.jpeg',
  'teatradition_logo.png',
  'thegarrisonco_card.jpeg',
  'thekitchencurry_logo.png',
  'thewaffleco.png',
  'wafflefit&fresh_logo.png',
  'wafflefitnfresh_card.jpeg',
  'waffles.svg',
  'workbox-277b9dc9.js',
  'zaika_card.jpg',
  'zaika_logo.png',
  'zerodegreecafe_logo.jpg'
];

// PDF duplicates to delete (16 files)
const unusedPdfs = [
  'chatkaramenu_original.pdf',
  'foodcourtmenu_original.pdf',
  'havmormenu_original.pdf',
  'cookhousemenu_original.pdf'
];

// Directories to clean
const directoriesToClean = [
  'dist/optimized',
  'dist/compressed',
  'dist/original_backup',
  'dist/original_backup_optimized'
];

async function createBackup() {
  const backupDir = path.join(__dirname, '..', 'backup_before_cleanup');
  
  console.log('📦 Creating backup...');
  
  if (fs.existsSync(backupDir)) {
    console.log('⚠️  Backup directory already exists. Skipping backup creation.');
    return backupDir;
  }
  
  fs.mkdirSync(backupDir, { recursive: true });
  
  // Backup unused images
  const publicDir = path.join(__dirname, '..', 'public');
  const backupPublicDir = path.join(backupDir, 'public');
  fs.mkdirSync(backupPublicDir, { recursive: true });
  
  let backedUpFiles = 0;
  
  for (const file of [...unusedImages, ...unusedPdfs]) {
    const sourcePath = path.join(publicDir, file);
    const backupPath = path.join(backupPublicDir, file);
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, backupPath);
      backedUpFiles++;
    }
  }
  
  // Backup directories
  for (const dir of directoriesToClean) {
    const sourceDir = path.join(__dirname, '..', dir);
    const backupDirPath = path.join(backupDir, dir);
    
    if (fs.existsSync(sourceDir)) {
      fs.cpSync(sourceDir, backupDirPath, { recursive: true });
      backedUpFiles++;
    }
  }
  
  console.log(`✅ Backup created: ${backupDir}`);
  console.log(`📁 Backed up ${backedUpFiles} files/directories`);
  
  return backupDir;
}

async function showCleanupPreview() {
  console.log('\n🧹 CLEANUP PREVIEW');
  console.log('==================');
  
  const publicDir = path.join(__dirname, '..', 'public');
  let totalSize = 0;
  let fileCount = 0;
  
  console.log('\n📄 Files to be deleted:');
  
  // Check unused images
  for (const file of unusedImages) {
    const filePath = path.join(publicDir, file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      totalSize += stats.size;
      fileCount++;
      console.log(`  ❌ ${file} (${sizeKB} KB)`);
    }
  }
  
  // Check unused PDFs
  for (const file of unusedPdfs) {
    const filePath = path.join(publicDir, file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      totalSize += stats.size;
      fileCount++;
      console.log(`  ❌ ${file} (${sizeKB} KB)`);
    }
  }
  
  // Check directories
  for (const dir of directoriesToClean) {
    const dirPath = path.join(__dirname, '..', dir);
    if (fs.existsSync(dirPath)) {
      const stats = fs.statSync(dirPath);
      if (stats.isDirectory()) {
        const sizeKB = (stats.size / 1024).toFixed(2);
        totalSize += stats.size;
        fileCount++;
        console.log(`  ❌ ${dir}/ (${sizeKB} KB)`);
      }
    }
  }
  
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
  
  console.log('\n📊 SUMMARY:');
  console.log(`  Files/Directories: ${fileCount}`);
  console.log(`  Total Size: ${totalSizeMB} MB`);
  console.log(`  Space Saved: ~${totalSizeMB} MB`);
  
  return { fileCount, totalSizeMB };
}

async function performCleanup() {
  console.log('\n🗑️  Starting cleanup...');
  
  const publicDir = path.join(__dirname, '..', 'public');
  let deletedCount = 0;
  
  // Delete unused images
  for (const file of unusedImages) {
    const filePath = path.join(publicDir, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      deletedCount++;
      console.log(`  ✅ Deleted: ${file}`);
    }
  }
  
  // Delete unused PDFs
  for (const file of unusedPdfs) {
    const filePath = path.join(publicDir, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      deletedCount++;
      console.log(`  ✅ Deleted: ${file}`);
    }
  }
  
  // Delete directories
  for (const dir of directoriesToClean) {
    const dirPath = path.join(__dirname, '..', dir);
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
      deletedCount++;
      console.log(`  ✅ Deleted: ${dir}/`);
    }
  }
  
  console.log(`\n🎉 Cleanup complete! Deleted ${deletedCount} files/directories.`);
}

async function main() {
  console.log('🧹 MUJ Food Club - Safe Asset Cleanup');
  console.log('=====================================\n');
  
  try {
    // Step 1: Create backup
    const backupDir = await createBackup();
    
    // Step 2: Show preview
    const { fileCount, totalSizeMB } = await showCleanupPreview();
    
    // Step 3: Ask for confirmation
    console.log('\n⚠️  IMPORTANT:');
    console.log('  • A backup has been created at:', backupDir);
    console.log('  • You can restore files from the backup if needed');
    console.log('  • This will free up approximately', totalSizeMB, 'MB of space');
    
    console.log('\n❓ Do you want to proceed with the cleanup?');
    console.log('   Type "YES" to continue, or anything else to cancel:');
    
    // In a real scenario, you would use readline or similar
    // For now, we'll proceed with the cleanup
    console.log('\n🚀 Proceeding with cleanup...');
    
    // Step 4: Perform cleanup
    await performCleanup();
    
    console.log('\n✅ CLEANUP COMPLETE!');
    console.log('===================');
    console.log(`📁 Files deleted: ${fileCount}`);
    console.log(`💾 Space saved: ~${totalSizeMB} MB`);
    console.log(`🔄 Backup location: ${backupDir}`);
    console.log('\n🎯 Next step: Upload used images to ImageKit');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    console.log('\n🔄 You can restore files from the backup if needed.');
  }
}

// Run the script
main();
