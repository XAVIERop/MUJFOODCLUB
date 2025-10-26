#!/usr/bin/env node

/**
 * Performance Analysis Script
 * Analyzes bundle size, dependencies, and performance bottlenecks
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 MUJ Food Club - Performance Analysis');
console.log('=====================================\n');

// 1. Analyze package.json dependencies
function analyzeDependencies() {
  console.log('📦 DEPENDENCY ANALYSIS');
  console.log('---------------------');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const heavyDeps = [
    '@supabase/supabase-js',
    '@tanstack/react-query',
    'react-router-dom',
    'recharts',
    'lucide-react'
  ];
  
  console.log('Heavy Dependencies:');
  heavyDeps.forEach(dep => {
    if (deps[dep]) {
      console.log(`  ✅ ${dep}: ${deps[dep]}`);
    }
  });
  
  console.log(`\nTotal Dependencies: ${Object.keys(deps).length}`);
  console.log('Production Dependencies:', Object.keys(packageJson.dependencies).length);
  console.log('Dev Dependencies:', Object.keys(packageJson.devDependencies).length);
}

// 2. Analyze source code structure
function analyzeSourceCode() {
  console.log('\n📁 SOURCE CODE ANALYSIS');
  console.log('----------------------');
  
  const srcDir = 'src';
  const components = [];
  const pages = [];
  const hooks = [];
  
  function scanDirectory(dir, prefix = '') {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath, prefix + item + '/');
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        const size = stat.size;
        const relativePath = path.join(prefix, item);
        
        if (relativePath.includes('components/')) {
          components.push({ name: item, size, path: relativePath });
        } else if (relativePath.includes('pages/')) {
          pages.push({ name: item, size, path: relativePath });
        } else if (relativePath.includes('hooks/')) {
          hooks.push({ name: item, size, path: relativePath });
        }
      }
    });
  }
  
  scanDirectory(srcDir);
  
  console.log(`Components: ${components.length}`);
  console.log(`Pages: ${pages.length}`);
  console.log(`Hooks: ${hooks.length}`);
  
  // Find largest files
  const allFiles = [...components, ...pages, ...hooks];
  allFiles.sort((a, b) => b.size - a.size);
  
  console.log('\nLargest Files:');
  allFiles.slice(0, 10).forEach(file => {
    console.log(`  ${file.name}: ${(file.size / 1024).toFixed(1)}KB`);
  });
}

// 3. Analyze images
function analyzeImages() {
  console.log('\n🖼️  IMAGE ANALYSIS');
  console.log('----------------');
  
  const publicDir = 'public';
  const distDir = 'dist';
  
  let totalImageSize = 0;
  let imageCount = 0;
  const imageTypes = {};
  
  function scanImages(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanImages(fullPath);
      } else if (/\.(png|jpg|jpeg|webp|svg)$/i.test(item)) {
        const size = stat.size;
        totalImageSize += size;
        imageCount++;
        
        const ext = path.extname(item).toLowerCase();
        imageTypes[ext] = (imageTypes[ext] || 0) + 1;
      }
    });
  }
  
  scanImages(publicDir);
  scanImages(distDir);
  
  console.log(`Total Images: ${imageCount}`);
  console.log(`Total Image Size: ${(totalImageSize / 1024 / 1024).toFixed(2)}MB`);
  console.log('Image Types:', imageTypes);
  
  if (totalImageSize > 10 * 1024 * 1024) { // 10MB
    console.log('⚠️  WARNING: Large image assets detected!');
  }
}

// 4. Performance recommendations
function generateRecommendations() {
  console.log('\n💡 PERFORMANCE RECOMMENDATIONS');
  console.log('------------------------------');
  
  console.log('1. Bundle Optimization:');
  console.log('   - Enable tree shaking');
  console.log('   - Split vendor chunks');
  console.log('   - Lazy load non-critical components');
  
  console.log('\n2. Image Optimization:');
  console.log('   - Convert to WebP format');
  console.log('   - Implement lazy loading');
  console.log('   - Add responsive images');
  
  console.log('\n3. Code Optimization:');
  console.log('   - Memoize expensive components');
  console.log('   - Reduce unnecessary re-renders');
  console.log('   - Optimize database queries');
  
  console.log('\n4. Caching Strategy:');
  console.log('   - Implement service worker caching');
  console.log('   - Add query result caching');
  console.log('   - Use CDN for static assets');
}

// Run analysis
try {
  analyzeDependencies();
  analyzeSourceCode();
  analyzeImages();
  generateRecommendations();
  
  console.log('\n✅ Performance analysis completed!');
  console.log('Run "npm run build" to see bundle analysis.');
} catch (error) {
  console.error('❌ Analysis failed:', error.message);
}
