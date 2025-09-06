#!/usr/bin/env node

/**
 * Production Setup Script
 * Automated setup for production readiness
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'your-supabase-url',
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || 'your-service-key',
  SETUP_STEPS: [
    'database_optimization',
    'monitoring_setup',
    'security_config',
    'performance_testing',
    'deployment_prep'
  ]
};

// Initialize Supabase client
const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_SERVICE_KEY);

/**
 * Step 1: Database Optimization
 */
async function setupDatabaseOptimization() {
  console.log('🗄️  Setting up database optimization...');
  
  try {
    // Read and execute the database optimization script
    const optimizationScript = fs.readFileSync(
      path.join(__dirname, 'production_database_optimization.sql'),
      'utf8'
    );
    
    // Split the script into individual statements
    const statements = optimizationScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const statement of statements) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
        if (error) {
          console.log(`   ⚠️  Warning: ${error.message}`);
          errorCount++;
        } else {
          successCount++;
        }
      } catch (err) {
        console.log(`   ⚠️  Warning: ${err.message}`);
        errorCount++;
      }
    }
    
    console.log(`   ✅ Database optimization completed: ${successCount} successful, ${errorCount} warnings`);
    
  } catch (error) {
    console.error('   ❌ Database optimization failed:', error.message);
    throw error;
  }
}

/**
 * Step 2: Monitoring Setup
 */
async function setupMonitoring() {
  console.log('📊 Setting up monitoring system...');
  
  try {
    // Import and run monitoring setup
    const { setupMonitoring } = await import('./setup_monitoring.js');
    await setupMonitoring();
    console.log('   ✅ Monitoring system setup completed');
    
  } catch (error) {
    console.error('   ❌ Monitoring setup failed:', error.message);
    throw error;
  }
}

/**
 * Step 3: Security Configuration
 */
async function setupSecurityConfig() {
  console.log('🔒 Setting up security configuration...');
  
  try {
    // Create security configuration
    const securityConfig = {
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
      },
      rateLimiting: {
        enabled: true,
        windowMs: 900000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP, please try again later.'
      },
      cors: {
        origin: process.env.PRODUCTION_DOMAIN || 'https://your-app.vercel.app',
        credentials: true
      }
    };
    
    // Save security configuration
    const configPath = path.join(process.cwd(), 'security.config.json');
    fs.writeFileSync(configPath, JSON.stringify(securityConfig, null, 2));
    
    console.log('   ✅ Security configuration saved to security.config.json');
    
  } catch (error) {
    console.error('   ❌ Security configuration failed:', error.message);
    throw error;
  }
}

/**
 * Step 4: Performance Testing
 */
async function runPerformanceTest() {
  console.log('⚡ Running performance test...');
  
  try {
    // Import and run load test
    const { testDatabasePerformance } = await import('./load_test.js');
    await testDatabasePerformance();
    console.log('   ✅ Performance test completed');
    
  } catch (error) {
    console.error('   ❌ Performance test failed:', error.message);
    throw error;
  }
}

/**
 * Step 5: Deployment Preparation
 */
async function prepareDeployment() {
  console.log('🚀 Preparing for deployment...');
  
  try {
    // Create deployment configuration
    const deploymentConfig = {
      environment: 'production',
      build: {
        command: 'npm run build',
        output: 'dist',
        installCommand: 'npm ci'
      },
      env: {
        VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
        VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
        VITE_SENTRY_DSN: process.env.VITE_SENTRY_DSN,
        VITE_VERCEL_ANALYTICS_ID: process.env.VITE_VERCEL_ANALYTICS_ID
      },
      monitoring: {
        healthCheck: '/api/health',
        metrics: '/api/metrics',
        alerts: true
      }
    };
    
    // Save deployment configuration
    const configPath = path.join(process.cwd(), 'deployment.config.json');
    fs.writeFileSync(configPath, JSON.stringify(deploymentConfig, null, 2));
    
    // Create production environment file
    const envContent = `# Production Environment Variables
VITE_SUPABASE_URL=${process.env.VITE_SUPABASE_URL || 'your-supabase-url'}
VITE_SUPABASE_ANON_KEY=${process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-key'}
VITE_SENTRY_DSN=${process.env.VITE_SENTRY_DSN || 'your-sentry-dsn'}
VITE_VERCEL_ANALYTICS_ID=${process.env.VITE_VERCEL_ANALYTICS_ID || 'your-analytics-id'}
`;
    
    const envPath = path.join(process.cwd(), '.env.production');
    fs.writeFileSync(envPath, envContent);
    
    console.log('   ✅ Deployment configuration saved');
    console.log('   ✅ Production environment file created');
    
  } catch (error) {
    console.error('   ❌ Deployment preparation failed:', error.message);
    throw error;
  }
}

/**
 * Generate setup report
 */
function generateSetupReport(results) {
  console.log('\n📋 PRODUCTION SETUP REPORT');
  console.log('='.repeat(50));
  
  const totalSteps = results.length;
  const successfulSteps = results.filter(r => r.success).length;
  const failedSteps = results.filter(r => !r.success).length;
  
  console.log(`📊 Setup Summary:`);
  console.log(`   Total Steps: ${totalSteps}`);
  console.log(`   Successful: ${successfulSteps}`);
  console.log(`   Failed: ${failedSteps}`);
  console.log(`   Success Rate: ${((successfulSteps / totalSteps) * 100).toFixed(1)}%`);
  console.log('');
  
  console.log('📝 Step Details:');
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    const stepName = result.step.replace(/_/g, ' ').toUpperCase();
    console.log(`   ${status} ${index + 1}. ${stepName}`);
    if (result.error) {
      console.log(`      Error: ${result.error}`);
    }
  });
  
  console.log('');
  
  if (failedSteps === 0) {
    console.log('🎉 PRODUCTION SETUP COMPLETED SUCCESSFULLY!');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. Review the generated configuration files');
    console.log('2. Update environment variables in your hosting platform');
    console.log('3. Deploy to production using the deployment checklist');
    console.log('4. Monitor the system using the monitoring dashboard');
    console.log('5. Set up automated backups and maintenance');
    console.log('');
    console.log('📚 Documentation:');
    console.log('   - Production Readiness Guide: PRODUCTION_READINESS_GUIDE.md');
    console.log('   - Deployment Checklist: DEPLOYMENT_CHECKLIST.md');
    console.log('   - Monitoring Setup: scripts/setup_monitoring.js');
    console.log('   - Load Testing: scripts/load_test.js');
  } else {
    console.log('⚠️  PRODUCTION SETUP COMPLETED WITH ISSUES');
    console.log('');
    console.log('🔧 Required Actions:');
    console.log('1. Review and fix the failed steps above');
    console.log('2. Re-run the setup script after fixing issues');
    console.log('3. Verify all configurations before deployment');
    console.log('');
  }
  
  console.log('');
}

/**
 * Main setup function
 */
async function setupProduction() {
  console.log('🚀 PRODUCTION SETUP FOR MUJ FOOD CLUB');
  console.log('='.repeat(50));
  console.log('Preparing for 12,000+ students and 30+ cafes');
  console.log('');
  
  const results = [];
  
  // Step 1: Database Optimization
  try {
    await setupDatabaseOptimization();
    results.push({ step: 'database_optimization', success: true });
  } catch (error) {
    results.push({ step: 'database_optimization', success: false, error: error.message });
  }
  
  // Step 2: Monitoring Setup
  try {
    await setupMonitoring();
    results.push({ step: 'monitoring_setup', success: true });
  } catch (error) {
    results.push({ step: 'monitoring_setup', success: false, error: error.message });
  }
  
  // Step 3: Security Configuration
  try {
    await setupSecurityConfig();
    results.push({ step: 'security_config', success: true });
  } catch (error) {
    results.push({ step: 'security_config', success: false, error: error.message });
  }
  
  // Step 4: Performance Testing
  try {
    await runPerformanceTest();
    results.push({ step: 'performance_testing', success: true });
  } catch (error) {
    results.push({ step: 'performance_testing', success: false, error: error.message });
  }
  
  // Step 5: Deployment Preparation
  try {
    await prepareDeployment();
    results.push({ step: 'deployment_prep', success: true });
  } catch (error) {
    results.push({ step: 'deployment_prep', success: false, error: error.message });
  }
  
  // Generate report
  generateSetupReport(results);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupProduction();
}

export { setupProduction };
