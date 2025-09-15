# 🔧 Auth Configuration Guide

## Complete the final 3 security settings in your Supabase Dashboard

### 1. OTP Expiry Settings ⏰
**Location:** Authentication > Settings > Email Auth
- **Current Issue:** OTP expiry exceeds recommended threshold (more than 1 hour)
- **Fix:** Set OTP expiry to **1 hour** or less
- **Steps:**
  1. Go to Authentication > Settings
  2. Find "Email Auth" section
  3. Set "OTP expiry" to **3600 seconds** (1 hour) or less
  4. Save changes

### 2. Leaked Password Protection 🔒
**Location:** Authentication > Settings > Password Security
- **Current Issue:** Leaked password protection is currently disabled
- **Fix:** Enable leaked password protection
- **Steps:**
  1. Go to Authentication > Settings
  2. Find "Password Security" section
  3. Enable "Leaked password protection"
  4. This will check passwords against HaveIBeenPwned.org
  5. Save changes

### 3. Postgres Version 🗄️
**Location:** Settings > Database > Version
- **Current Issue:** Postgres version has security patches available
- **Current Version:** supabase-postgres-17.4.1.074
- **Fix:** Upgrade to latest version when available
- **Steps:**
  1. Go to Settings > Database
  2. Check for available updates
  3. Upgrade when new version is available
  4. This will apply latest security patches

## 🎯 After Configuration

Once you've configured these 3 settings:
- **✅ 0 Security Issues** (All database and auth security fixed)
- **✅ 0 Performance Issues** (All optimizations complete)
- **✅ 0 Database Issues** (Perfect database health)

## 🚀 Your Database Will Be 100% Optimized!

Your MUJ Food Club database will have:
- Enterprise-level security
- Optimal performance
- Production-ready configuration
- Zero remaining issues

