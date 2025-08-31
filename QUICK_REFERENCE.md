# 🚀 MUJFOODCLUB Quick Reference Card

## ⚡ **DAILY COMMANDS**

```bash
# Start development server
npm run dev          # or bun dev

# Check status
git status
git log --oneline -3

# Quick deploy
git add . && git commit -m "Description" && git push origin main
```

## 🛡️ **SAFETY COMMANDS**

```bash
# Create backup before changes
./scripts/development-workflow.sh backup

# Deploy safely
./scripts/development-workflow.sh deploy

# Check current status
./scripts/development-workflow.sh status
```

## 🚨 **EMERGENCY COMMANDS**

```bash
# Rollback to BETA (SAFE)
./scripts/development-workflow.sh beta

# Rollback to specific commit
./scripts/development-workflow.sh rollback

# Quick rollback (manual)
git reset --hard HEAD~1
git push origin main --force
```

## 🔄 **WORKFLOW OPTIONS**

### **Small Changes (Quick)**
1. Edit code → Test locally → Commit → Push → Wait 2-5 min

### **Big Changes (Safe)**
1. `./scripts/development-workflow.sh feature`
2. Edit code → Test locally → Commit
3. `./scripts/development-workflow.sh merge`
4. `./scripts/development-workflow.sh deploy`

## 📱 **TESTING CHECKLIST**

- [ ] **Homepage** loads correctly
- [ ] **Cafes page** works
- [ ] **Menu pages** functional
- [ ] **Authentication** works
- [ ] **Mobile** responsive
- [ ] **Database** operations work

## 🎯 **KEY SAFETY POINTS**

- ✅ **Always test locally** before pushing
- ✅ **BETA tag** is your safety net
- ✅ **Feature branches** for major changes
- ✅ **Backup before** big changes
- ✅ **Monitor deployment** status

## 🚀 **DEPLOYMENT FLOW**

```
Local Changes → Test → Commit → Push → Vercel Build → Live Site
     ↓              ↓       ↓       ↓        ↓          ↓
  localhost:3000  Verify  Git     GitHub  2-5 min   mujfoodclub.in
```

## 📞 **EMERGENCY CONTACTS**

- **GitHub**: https://github.com/XAVIERop/MUJFOODCLUB
- **Live Site**: https://mujfoodclub.in
- **Vercel**: https://vercel.com/dashboard
- **Supabase**: https://supabase.com/dashboard

---

**Remember**: Your BETA version is always safe! 🛡️
