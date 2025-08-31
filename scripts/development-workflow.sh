#!/bin/bash

# 🚀 MUJFOODCLUB Development Workflow Script
# This script provides safe development practices for the project

set -e  # Exit on any error

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

# Function to check if we're on main branch
check_main_branch() {
    current_branch=$(git branch --show-current)
    if [ "$current_branch" != "main" ]; then
        print_error "You are not on main branch. Current branch: $current_branch"
        print_status "Please checkout main branch first: git checkout main"
        exit 1
    fi
}

# Function to check git status
check_git_status() {
    if [ -n "$(git status --porcelain)" ]; then
        print_warning "You have uncommitted changes:"
        git status --short
        echo
        read -p "Do you want to commit these changes first? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            read -p "Enter commit message: " commit_msg
            git add .
            git commit -m "$commit_msg"
            print_success "Changes committed successfully"
        else
            print_error "Please commit or stash your changes before proceeding"
            exit 1
        fi
    fi
}

# Function to create feature branch
create_feature_branch() {
    read -p "Enter feature branch name (e.g., feature/new-menu): " branch_name
    if [ -z "$branch_name" ]; then
        print_error "Branch name cannot be empty"
        exit 1
    fi
    
    print_status "Creating feature branch: $branch_name"
    git checkout -b "$branch_name"
    print_success "Feature branch created and checked out"
}

# Function to merge feature branch
merge_feature_branch() {
    current_branch=$(git branch --show-current)
    if [ "$current_branch" = "main" ]; then
        print_error "You are on main branch. Please checkout your feature branch first"
        exit 1
    fi
    
    print_status "Merging feature branch: $current_branch into main"
    git checkout main
    git merge "$current_branch"
    print_success "Feature branch merged successfully"
    
    # Ask if user wants to delete the feature branch
    read -p "Do you want to delete the feature branch $current_branch? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git branch -d "$current_branch"
        git push origin --delete "$current_branch" 2>/dev/null || true
        print_success "Feature branch deleted"
    fi
}

# Function to deploy to production
deploy_to_production() {
    print_status "Deploying to production..."
    check_main_branch
    check_git_status
    
    print_status "Pushing to GitHub (triggers Vercel deployment)..."
    git push origin main
    
    print_success "Deployment triggered! Vercel will deploy in 2-5 minutes"
    print_status "Live site: https://mujfoodclub.in"
    print_status "Monitor deployment at: https://vercel.com/dashboard"
}

# Function to rollback to previous version
rollback() {
    print_warning "ROLLBACK OPERATION - This will reset your main branch"
    echo
    print_status "Recent commits:"
    git log --oneline -10
    echo
    
    read -p "Enter commit hash to rollback to: " commit_hash
    if [ -z "$commit_hash" ]; then
        print_error "Commit hash cannot be empty"
        exit 1
    fi
    
    print_warning "This will reset main branch to commit: $commit_hash"
    read -p "Are you sure? This action cannot be undone! (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Rolling back to commit: $commit_hash"
        git reset --hard "$commit_hash"
        git push origin main --force
        print_success "Rollback completed successfully"
    else
        print_status "Rollback cancelled"
    fi
}

# Function to rollback to BETA version
rollback_to_beta() {
    print_warning "ROLLBACK TO BETA VERSION - This will reset to v1.0.0-beta"
    read -p "Are you sure? This action cannot be undone! (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Rolling back to BETA version..."
        git checkout v1.0.0-beta
        git checkout -B main
        git push origin main --force
        print_success "Rollback to BETA version completed successfully"
    else
        print_status "Rollback cancelled"
    fi
}

# Function to create backup branch
create_backup() {
    backup_name="backup-$(date +%Y%m%d-%H%M)"
    print_status "Creating backup branch: $backup_name"
    git checkout -b "$backup_name"
    git push origin "$backup_name"
    print_success "Backup branch created: $backup_name"
    git checkout main
}

# Function to show current status
show_status() {
    print_status "Current Git Status:"
    echo
    print_status "Current branch: $(git branch --show-current)"
    print_status "Last commit: $(git log -1 --oneline)"
    print_status "Remote status:"
    git status --porcelain
    echo
    print_status "Recent commits:"
    git log --oneline -5
}

# Function to run local tests
run_local_tests() {
    print_status "Starting local development server..."
    print_status "This will start the server on localhost:3000"
    print_status "Press Ctrl+C to stop the server"
    echo
    
    # Check if bun is available, otherwise use npm
    if command -v bun &> /dev/null; then
        print_status "Using Bun for development server"
        bun dev
    else
        print_status "Using npm for development server"
        npm run dev
    fi
}

# Main menu
show_menu() {
    echo
    echo "🚀 MUJFOODCLUB Development Workflow"
    echo "=================================="
    echo "1.  Create feature branch"
    echo "2.  Merge feature branch to main"
    echo "3.  Deploy to production"
    echo "4.  Rollback to previous version"
    echo "5.  Rollback to BETA version (v1.0.0-beta)"
    echo "6.  Create backup branch"
    echo "7.  Show current status"
    echo "8.  Run local tests"
    echo "9.  Exit"
    echo
}

# Main script logic
main() {
    case "$1" in
        "1"|"feature")
            create_feature_branch
            ;;
        "2"|"merge")
            merge_feature_branch
            ;;
        "3"|"deploy")
            deploy_to_production
            ;;
        "4"|"rollback")
            rollback
            ;;
        "5"|"beta")
            rollback_to_beta
            ;;
        "6"|"backup")
            create_backup
            ;;
        "7"|"status")
            show_status
            ;;
        "8"|"test")
            run_local_tests
            ;;
        "9"|"exit")
            print_status "Goodbye!"
            exit 0
            ;;
        *)
            show_menu
            read -p "Select an option (1-9): " choice
            main "$choice"
            ;;
    esac
}

# Run main function with command line argument or show menu
if [ $# -eq 0 ]; then
    show_menu
    read -p "Select an option (1-9): " choice
    main "$choice"
else
    main "$1"
fi
