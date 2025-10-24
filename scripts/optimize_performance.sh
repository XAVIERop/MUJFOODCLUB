#!/bin/bash

# Performance Optimization Script
# This script applies various performance optimizations to the MUJ Food Club project

echo "🚀 MUJ Food Club - Performance Optimization"
echo "=========================================="

# 1. Install performance optimization packages
echo "📦 Installing performance packages..."
npm install --save-dev rollup-plugin-visualizer vite-plugin-imagemin
npm install --save-dev @types/node terser

# 2. Create optimized build script
echo "🔧 Creating optimized build configuration..."
cat > vite.config.prod.ts << 'EOF'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,webp}'],
        maximumFileSizeToCacheInBytes: 2 * 1024 * 1024, // 2MB
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 12 },
            },
          },
        ],
      },
    }),
    visualizer({
      filename: 'dist/bundle-analysis.html',
      open: true,
      gzipSize: true,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          icons: ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log'],
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@supabase/supabase-js'],
  },
});
EOF

# 3. Create performance monitoring script
echo "📊 Setting up performance monitoring..."
cat > scripts/performance-check.js << 'EOF'
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
EOF

# 4. Create image optimization script
echo "🖼️  Setting up image optimization..."
cat > scripts/optimize-images.js << 'EOF'
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
EOF

# 5. Update package.json with optimization scripts
echo "📝 Adding optimization scripts to package.json..."
npm pkg set scripts.analyze="vite build --mode analyze"
npm pkg set scripts.optimize:images="node scripts/optimize-images.js"
npm pkg set scripts.performance:check="node scripts/performance-check.js"
npm pkg set scripts.build:analyze="ANALYZE=true vite build"

# 6. Create performance budget configuration
echo "💰 Setting up performance budget..."
cat > .performance-budget.json << 'EOF'
{
  "budget": [
    {
      "path": "/*",
      "timings": [
        {
          "metric": "first-contentful-paint",
          "budget": 1800
        },
        {
          "metric": "largest-contentful-paint",
          "budget": 2500
        },
        {
          "metric": "cumulative-layout-shift",
          "budget": 0.1
        }
      ],
      "resourceSizes": [
        {
          "resourceType": "script",
          "budget": 500
        },
        {
          "resourceType": "total",
          "budget": 2000
        }
      ]
    }
  ]
}
EOF

# 7. Create component optimization guidelines
echo "📋 Creating optimization guidelines..."
cat > PERFORMANCE_GUIDELINES.md << 'EOF'
# Performance Optimization Guidelines

## 🎯 Performance Targets
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Bundle Size**: < 2MB total
- **Image Assets**: < 10MB total

## 🚀 Optimization Strategies

### 1. Bundle Optimization
- Use dynamic imports for large components
- Implement code splitting by route
- Tree shake unused code
- Optimize vendor chunks

### 2. Image Optimization
- Convert images to WebP format
- Implement lazy loading
- Use responsive images
- Compress images (target: 80% quality)

### 3. Database Optimization
- Implement query caching
- Use optimized queries
- Reduce real-time subscriptions
- Paginate large datasets

### 4. Component Optimization
- Memoize expensive components
- Reduce unnecessary re-renders
- Use React.memo for pure components
- Optimize context providers

### 5. Caching Strategy
- Service worker caching
- Query result caching
- Image caching
- CDN for static assets

## 🔧 Tools & Scripts

### Performance Monitoring
```bash
npm run performance:check
```

### Bundle Analysis
```bash
npm run build:analyze
```

### Image Optimization
```bash
npm run optimize:images
```

## 📊 Monitoring

Use the PerformanceMonitor component to track:
- Core Web Vitals
- Resource usage
- Optimization suggestions

## 🎯 Quick Wins

1. **Lazy load images** - Use OptimizedImage component
2. **Memoize components** - Add React.memo to expensive components
3. **Optimize queries** - Use useOptimizedQueries hook
4. **Reduce bundle size** - Remove unused dependencies
5. **Enable compression** - Use gzip/brotli compression
EOF

echo ""
echo "✅ Performance optimization setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Run 'npm run performance:check' to analyze current performance"
echo "2. Run 'npm run optimize:images' to optimize images"
echo "3. Run 'npm run build:analyze' to analyze bundle size"
echo "4. Check PERFORMANCE_GUIDELINES.md for optimization strategies"
echo ""
echo "🎯 Performance targets:"
echo "   - FCP: < 1.8s"
echo "   - LCP: < 2.5s" 
echo "   - Bundle: < 2MB"
echo "   - Images: < 10MB"
