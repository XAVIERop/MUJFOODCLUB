# 🤖 Android Testing Guide

## ✅ Prerequisites Check

- ✅ Java 20 installed
- ✅ Android platform added
- ✅ Build completed

---

## 🚀 Quick Start Testing

### Option 1: Open in Android Studio (Recommended)

```bash
npm run cap:open:android
```

This will:
1. Open Android Studio
2. Load the Android project
3. Wait for Gradle sync

**Then in Android Studio:**
1. Wait for Gradle sync to complete (bottom status bar)
2. Click **"Device Manager"** (top right)
3. Create a virtual device OR connect a real device
4. Click the **Run** button (▶️ green play button)

---

### Option 2: Command Line (Advanced)

**Build APK:**
```bash
cd android
./gradlew assembleDebug
```

**Install on connected device:**
```bash
./gradlew installDebug
```

---

## 📱 Testing on Real Android Device

### Step 1: Enable Developer Mode

1. Go to **Settings** → **About Phone**
2. Tap **"Build Number"** 7 times
3. You'll see "You are now a developer!"

### Step 2: Enable USB Debugging

1. Go to **Settings** → **Developer Options**
2. Enable **"USB Debugging"**
3. Connect phone via USB
4. Accept "Allow USB debugging?" prompt on phone

### Step 3: Verify Connection

```bash
adb devices
```

Should show your device listed.

### Step 4: Run App

In Android Studio:
1. Select your device from device dropdown
2. Click **Run** (▶️)

---

## 🧪 What to Test

### Basic Functionality

1. **App Launches**
   - ✅ App opens without crashes
   - ✅ Splash screen shows
   - ✅ Main page loads

2. **Navigation**
   - ✅ Homepage loads
   - ✅ Can navigate to cafes
   - ✅ Can open menu
   - ✅ Can go to checkout

3. **Authentication**
   - ✅ Sign in works
   - ✅ Sign up works
   - ✅ Profile loads

4. **Ordering**
   - ✅ Add items to cart
   - ✅ Checkout flow works
   - ✅ Order placement works

5. **Native Features**
   - ✅ Camera access (if implemented)
   - ✅ Network status detection
   - ✅ Haptic feedback (if implemented)

---

## 🐛 Common Issues & Fixes

### Issue 1: "Gradle sync failed"

**Fix:**
1. In Android Studio: **File** → **Invalidate Caches** → **Restart**
2. **File** → **Sync Project with Gradle Files**

### Issue 2: "SDK not found"

**Fix:**
1. Android Studio → **Tools** → **SDK Manager**
2. Install Android SDK (API 33 or 34)
3. Install Android SDK Build-Tools

### Issue 3: "Device not detected"

**Fix:**
```bash
# Check ADB
adb devices

# Restart ADB
adb kill-server
adb start-server

# Check USB connection
# Try different USB port/cable
```

### Issue 4: "App crashes on launch"

**Check:**
1. Android Studio → **Logcat** tab
2. Look for error messages
3. Check if Supabase URL is correct
4. Verify environment variables

### Issue 5: "White screen"

**Possible causes:**
- Supabase connection issue
- JavaScript error
- Missing environment variables

**Fix:**
1. Check Logcat for errors
2. Open Chrome DevTools: `chrome://inspect`
3. Inspect the app
4. Check console for errors

---

## 📊 Testing Checklist

### First Launch
- [ ] App installs successfully
- [ ] Splash screen appears
- [ ] Homepage loads
- [ ] No crashes

### Navigation
- [ ] Can browse cafes
- [ ] Can view menus
- [ ] Can navigate back
- [ ] Bottom navigation works (if on mobile)

### Authentication
- [ ] Can sign in
- [ ] Can sign up
- [ ] Profile page loads
- [ ] Can sign out

### Ordering Flow
- [ ] Can add items to cart
- [ ] Cart shows correct items
- [ ] Can proceed to checkout
- [ ] Can place order
- [ ] Order confirmation shows

### Native Features
- [ ] Camera permission prompt (if using camera)
- [ ] Network status works
- [ ] App responds to back button
- [ ] Status bar styling correct

### Performance
- [ ] App loads quickly
- [ ] Smooth scrolling
- [ ] No lag when navigating
- [ ] Images load properly

---

## 🔍 Debugging Tools

### Android Studio Logcat

**View logs:**
1. Open **Logcat** tab (bottom of Android Studio)
2. Filter by "MUJ" or "Food Club"
3. Look for errors (red) or warnings (yellow)

### Chrome DevTools (Remote Debugging)

**Enable:**
1. Connect device via USB
2. Open Chrome: `chrome://inspect`
3. Find your app
4. Click **"inspect"**

**Useful for:**
- Console logs
- Network requests
- Performance profiling
- Debugging JavaScript

### ADB Commands

```bash
# View logs
adb logcat | grep -i "foodclub"

# Clear app data
adb shell pm clear in.mujfoodclub.app

# Uninstall app
adb uninstall in.mujfoodclub.app

# Install APK
adb install app-debug.apk
```

---

## 📝 Testing Notes Template

```
Date: ___________
Device: ___________
Android Version: ___________

Issues Found:
1. 
2. 
3. 

Features Working:
- 
- 
- 

Performance:
- Load time: ___ seconds
- Smooth scrolling: Yes/No
- Any lag: Yes/No
```

---

## 🎯 Next Steps After Testing

1. **Fix any issues found**
2. **Test on multiple devices** (different screen sizes)
3. **Test on different Android versions** (if possible)
4. **Prepare for production build**
5. **Set up app signing** (for Play Store)

---

## 🚨 If App Doesn't Work

**Check these first:**

1. **Environment Variables:**
   - Supabase URL correct?
   - Supabase anon key correct?
   - Other API keys set?

2. **Network:**
   - Device has internet?
   - Can reach Supabase?
   - Firewall blocking?

3. **Permissions:**
   - Camera permission (if using)
   - Internet permission (should be automatic)

4. **Build:**
   - Latest build synced?
   - Run `npm run build && npx cap sync android`

---

**Ready to test?** Run:
```bash
npm run cap:open:android
```

Then follow the steps above! 🚀

