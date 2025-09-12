# 🚀 Professional Git Workflow - MUJ Food Club

## **📋 Current Status**
- **Main Branch**: Production-ready code (mujfoodclub.in)
- **Develop Branch**: Integration branch for features
- **Feature Branches**: Individual feature development

## **🔄 Professional Workflow Rules**

### **1. NEVER Push Directly to Main**
```bash
# ❌ WRONG - What we were doing:
git add .
git commit -m "changes"
git push origin main

# ✅ CORRECT - Professional way:
git checkout -b feature/feature-name
git add .
git commit -m "feat: add feature description"
git push origin feature/feature-name
# Then create Pull Request
```

### **2. Branch Structure**
```
main (production)
├── develop (integration)
├── feature/user-authentication
├── feature/payment-integration
├── hotfix/critical-bug-fix
└── release/v1.2.0
```

### **3. Development Process**

#### **For New Features:**
```bash
# 1. Start from develop
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/feature-name

# 3. Develop feature
# Make changes, commit frequently
git add .
git commit -m "feat: implement feature X"
git push origin feature/feature-name

# 4. Create Pull Request
# - Go to GitHub
# - Create PR: feature/feature-name → develop
# - Add description, reviewers

# 5. After approval, merge
# - Merge PR to develop
# - Delete feature branch
```

#### **For Hotfixes (Critical Issues):**
```bash
# 1. Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-issue

# 2. Fix the issue
git add .
git commit -m "hotfix: fix critical production issue"
git push origin hotfix/critical-issue

# 3. Create PR: hotfix/critical-issue → main
# 4. Merge immediately after review
# 5. Merge back to develop
```

#### **For Releases:**
```bash
# 1. Create release branch
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# 2. Final testing and bug fixes
# 3. Merge to main
git checkout main
git merge release/v1.2.0
git tag v1.2.0
git push origin main --tags

# 4. Merge back to develop
git checkout develop
git merge release/v1.2.0
git push origin develop
```

## **🛡️ Safety Measures**

### **1. Branch Protection Rules**
- **Main Branch**: Require pull request reviews
- **Develop Branch**: Require pull request reviews
- **Feature Branches**: No direct push protection

### **2. Commit Message Standards**
```
type(scope): description

Types:
- feat: new feature
- fix: bug fix
- docs: documentation
- style: formatting
- refactor: code refactoring
- test: add tests
- chore: maintenance

Examples:
feat(auth): add magic link authentication
fix(checkout): resolve payment validation error
docs(readme): update installation instructions
```

### **3. Code Review Checklist**
- [ ] Code follows project standards
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance impact considered
- [ ] Database migrations included

## **🚀 Deployment Strategy**

### **Environment Mapping**
- **Main Branch** → **Production** (mujfoodclub.in)
- **Develop Branch** → **Staging** (staging.mujfoodclub.in)
- **Feature Branches** → **Preview** (feature-branch.vercel.app)

### **Deployment Process**
1. **Feature Development** → Feature Branch
2. **Code Review** → Pull Request
3. **Testing** → Staging Environment
4. **Release** → Main Branch
5. **Production** → Live Site

## **📊 Current Project Status**

### **Recent Changes Made Directly to Main (Unprofessional)**
- ELICIT 2025 event system
- HACKX Room Number field
- UTR ID validation
- Loyalty system removal for ELICIT
- Cafe loading fixes

### **Going Forward (Professional)**
- All new features will use feature branches
- All changes will go through pull request process
- Main branch will only receive merged, reviewed code
- Staging environment will be used for testing

## **🔧 Quick Commands**

### **Daily Workflow**
```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/feature-name

# Work on feature
git add .
git commit -m "feat: add feature description"
git push origin feature/feature-name

# Create Pull Request on GitHub
# After approval, merge and delete branch
```

### **Emergency Hotfix**
```bash
# Critical production issue
git checkout main
git pull origin main
git checkout -b hotfix/critical-issue
# Fix issue
git add .
git commit -m "hotfix: fix critical issue"
git push origin hotfix/critical-issue
# Create PR and merge immediately
```

## **📝 Notes**
- This workflow ensures code quality and safety
- All changes are reviewed before going to production
- Easy to rollback specific features if needed
- Team collaboration is improved
- Production stability is maintained
