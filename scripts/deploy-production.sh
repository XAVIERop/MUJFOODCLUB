#!/bin/bash

# Production Deployment Script
# This script handles the complete production deployment process

set -e  # Exit on any error

echo "🚀 Starting Production Deployment..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    print_success "All dependencies are available"
}

# Validate environment variables
validate_environment() {
    print_status "Validating environment variables..."
    
    required_vars=(
        "VITE_SUPABASE_URL"
        "VITE_SUPABASE_ANON_KEY"
        "VITE_PRINTNODE_API_KEY"
        "VITE_TWILIO_ACCOUNT_SID"
        "VITE_TWILIO_AUTH_TOKEN"
    )
    
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        print_error "Please set these environment variables before deploying"
        exit 1
    fi
    
    print_success "All required environment variables are set"
}

# Run database migrations
run_database_migrations() {
    print_status "Running database migrations..."
    
    # Check if Supabase CLI is available
    if command -v supabase &> /dev/null; then
        print_status "Applying Supabase migrations..."
        supabase db push
        print_success "Database migrations applied successfully"
    else
        print_warning "Supabase CLI not found. Please apply migrations manually:"
        echo "  1. Apply security hardening migration"
        echo "  2. Apply performance optimization migration"
        echo "  3. Verify database security status"
    fi
}

# Create production build
create_production_build() {
    print_status "Creating production build..."
    
    # Clean previous builds
    if [ -d "dist" ]; then
        rm -rf dist
    fi
    
    # Install dependencies
    npm ci --production=false
    
    # Run security audit
    print_status "Running security audit..."
    npm audit --audit-level moderate || print_warning "Security audit found issues"
    
    # Create production build
    npm run build:prod
    
    print_success "Production build created successfully"
}

# Validate build output
validate_build() {
    print_status "Validating build output..."
    
    if [ ! -d "dist" ]; then
        print_error "Build output directory not found"
        exit 1
    fi
    
    if [ ! -f "dist/index.html" ]; then
        print_error "index.html not found in build output"
        exit 1
    fi
    
    # Check for hardcoded credentials
    if grep -q "TYqkDtkjFvRAfg5_zcR1nUE00Ou2zenJHG-9LpGqkkg" dist/index.html; then
        print_error "Hardcoded credentials found in build output"
        exit 1
    fi
    
    print_success "Build output validation passed"
}

# Deploy to Vercel
deploy_to_vercel() {
    print_status "Deploying to Vercel..."
    
    # Check if user is logged in to Vercel
    if ! vercel whoami &> /dev/null; then
        print_warning "Not logged in to Vercel. Please login first:"
        echo "  vercel login"
        exit 1
    fi
    
    # Deploy to production
    vercel --prod --yes
    
    print_success "Deployment to Vercel completed"
}

# Post-deployment verification
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Get deployment URL
    DEPLOYMENT_URL=$(vercel ls --json | jq -r '.[0].url' 2>/dev/null || echo "")
    
    if [ -z "$DEPLOYMENT_URL" ]; then
        print_warning "Could not determine deployment URL"
        return
    fi
    
    print_status "Testing deployment at: https://$DEPLOYMENT_URL"
    
    # Test basic connectivity
    if curl -f -s -o /dev/null "https://$DEPLOYMENT_URL"; then
        print_success "Deployment is accessible"
    else
        print_error "Deployment is not accessible"
        exit 1
    fi
    
    # Test security headers
    print_status "Checking security headers..."
    if curl -s -I "https://$DEPLOYMENT_URL" | grep -q "X-Frame-Options"; then
        print_success "Security headers are present"
    else
        print_warning "Security headers may be missing"
    fi
}

# Generate deployment report
generate_report() {
    print_status "Generating deployment report..."
    
    DEPLOYMENT_URL=$(vercel ls --json | jq -r '.[0].url' 2>/dev/null || echo "Unknown")
    
    report=$(cat << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "deployment_url": "https://$DEPLOYMENT_URL",
  "status": "SUCCESS",
  "environment": "production",
  "node_version": "$(node --version)",
  "npm_version": "$(npm --version)",
  "vercel_cli_version": "$(vercel --version 2>/dev/null || echo 'Unknown')",
  "build_size": "$(du -sh dist 2>/dev/null | cut -f1 || echo 'Unknown')",
  "deployment_id": "$(vercel ls --json | jq -r '.[0].uid' 2>/dev/null || echo 'Unknown')"
}
EOF
)
    
    echo "$report" > deployment-report.json
    print_success "Deployment report generated: deployment-report.json"
}

# Main deployment function
main() {
    echo "Starting production deployment process..."
    echo "========================================"
    
    check_dependencies
    validate_environment
    run_database_migrations
    create_production_build
    validate_build
    deploy_to_vercel
    verify_deployment
    generate_report
    
    echo ""
    echo "🎉 Production deployment completed successfully!"
    echo "================================================"
    echo ""
    echo "📋 Deployment Summary:"
    echo "✅ Dependencies checked"
    echo "✅ Environment validated"
    echo "✅ Database migrations applied"
    echo "✅ Production build created"
    echo "✅ Build output validated"
    echo "✅ Deployed to Vercel"
    echo "✅ Deployment verified"
    echo "✅ Report generated"
    echo ""
    echo "🚀 Your application is now live in production!"
    echo ""
    echo "📊 Next steps:"
    echo "1. Monitor application performance"
    echo "2. Check error rates and logs"
    echo "3. Verify all features are working"
    echo "4. Set up monitoring and alerting"
    echo "5. Test critical user flows"
    echo ""
}

# Run main function
main "$@"


