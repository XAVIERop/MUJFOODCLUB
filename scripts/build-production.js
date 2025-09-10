#!/usr/bin/env node

/**
 * Production Build Script
 * This script creates a production build with proper error handling
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Production Build...\n');

// 1. Clean previous builds
function cleanBuild() {
  console.log('🧹 Cleaning previous builds...');
  try {
    if (fs.existsSync('dist')) {
      fs.rmSync('dist', { recursive: true, force: true });
    }
    if (fs.existsSync('node_modules/.vite')) {
      fs.rmSync('node_modules/.vite', { recursive: true, force: true });
    }
    console.log('✅ Build cleaned successfully\n');
  } catch (error) {
    console.error('❌ Failed to clean build:', error.message);
    process.exit(1);
  }
}

// 2. Install dependencies
function installDependencies() {
  console.log('📦 Installing dependencies...');
  try {
    execSync('npm ci --production=false', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully\n');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }
}

// 3. Run security audit
function runSecurityAudit() {
  console.log('🔒 Running security audit...');
  try {
    execSync('npm audit --audit-level moderate', { stdio: 'inherit' });
    console.log('✅ Security audit passed\n');
  } catch (error) {
    console.warn('⚠️  Security audit found issues, but continuing with build...\n');
  }
}

// 4. Create production build with error handling
function createProductionBuild() {
  console.log('🏗️  Creating production build...');
  try {
    // Set production environment
    process.env.NODE_ENV = 'production';
    process.env.VITE_APP_ENV = 'production';
    
    // Create build
    execSync('npm run build', { 
      stdio: 'inherit',
      env: { ...process.env }
    });
    
    console.log('✅ Production build created successfully\n');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// 5. Validate build output
function validateBuildOutput() {
  console.log('🔍 Validating build output...');
  
  const distPath = path.join(process.cwd(), 'dist');
  
  if (!fs.existsSync(distPath)) {
    console.error('❌ Build output directory not found');
    process.exit(1);
  }
  
  const requiredFiles = [
    'index.html',
    'assets',
  ];
  
  requiredFiles.forEach(file => {
    const filePath = path.join(distPath, file);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Required file/directory not found: ${file}`);
      process.exit(1);
    }
  });
  
  // Check for security issues in build
  const indexPath = path.join(distPath, 'index.html');
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Check for hardcoded credentials
  const suspiciousPatterns = [
    /TYqkDtkjFvRAfg5_zcR1nUE00Ou2zenJHG-9LpGqkkg/,
    /kblazvxfducwviyyiwde\.supabase\.co/,
    /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/,
  ];
  
  suspiciousPatterns.forEach(pattern => {
    if (pattern.test(indexContent)) {
      console.error('❌ Potential hardcoded credentials found in build output');
      process.exit(1);
    }
  });
  
  console.log('✅ Build output validation passed\n');
}

// 6. Generate build report
function generateBuildReport() {
  console.log('📊 Generating build report...');
  
  const distPath = path.join(process.cwd(), 'dist');
  const assetsPath = path.join(distPath, 'assets');
  
  let totalSize = 0;
  let fileCount = 0;
  
  if (fs.existsSync(assetsPath)) {
    const files = fs.readdirSync(assetsPath);
    files.forEach(file => {
      const filePath = path.join(assetsPath, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
      fileCount++;
    });
  }
  
  const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
  
  const report = {
    timestamp: new Date().toISOString(),
    buildSize: `${totalSizeMB} MB`,
    fileCount: fileCount,
    status: 'SUCCESS',
    environment: 'production',
    nodeVersion: process.version,
    platform: process.platform
  };
  
  fs.writeFileSync(
    path.join(process.cwd(), 'build-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log(`✅ Build report generated - Size: ${totalSizeMB} MB, Files: ${fileCount}\n`);
}

// 7. Main execution
async function main() {
  try {
    cleanBuild();
    installDependencies();
    runSecurityAudit();
    createProductionBuild();
    validateBuildOutput();
    generateBuildReport();
    
    console.log('🎉 Production build completed successfully!');
    console.log('\n📋 Build Summary:');
    console.log('✅ Dependencies installed');
    console.log('✅ Security audit completed');
    console.log('✅ Production build created');
    console.log('✅ Build output validated');
    console.log('✅ Build report generated');
    
    console.log('\n🚀 Ready for deployment!');
    
  } catch (error) {
    console.error('❌ Production build failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  cleanBuild,
  installDependencies,
  runSecurityAudit,
  createProductionBuild,
  validateBuildOutput,
  generateBuildReport
};


