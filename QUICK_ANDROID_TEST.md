# 🚀 Quick Android Testing Guide

## ✅ Setup Complete!

Your Android project is ready. Here's how to test it:

---

## 📱 Option 1: Open in Android Studio (Easiest)

**Run this command:**
```bash
npm run cap:open:android
```

**What happens:**
1. Android Studio opens automatically
2. Project loads (wait for Gradle sync - bottom status bar)
3. You'll see the Android project structure

**Then:**
1. **Create/Select Device:**
   - Click **"Device Manager"** (top toolbar)
   - Click **"Create Device"** (or select existing)
   - Choose a phone (e.g., Pixel 7)
   - Click **"Finish"**

2. **Run the App:**
   - Select your device from dropdown (top toolbar)
   - Click the green **Run** button (▶️)
   - App installs and launches!

---

## 📱 Option 2: Test on Real Android Phone

### Step 1: Enable Developer Mode
1. Go to **Settings** → **About Phone**
2. Tap **"Build Number"** 7 times
3. You'll see "You are now a developer!"

### Step 2: Enable USB Debugging
1. Go to **Settings** → **Developer Options**
2. Enable **"USB Debugging"**
3. Connect phone via USB
4. Accept "Allow USB debugging?" on phone

### Step 3: Verify Connection
```bash
adb devices
```
Should show your device.

### Step 4: Run from Android Studio
1. Open Android Studio: `npm run cap:open:android`
2. Select your phone from device dropdown
3. Click **Run** (▶️)

---

## 🧪 What to Test

### Basic Checks:
- [ ] App opens without crashing
- [ ] Homepage loads
- [ ] Can navigate to cafes
- [ ] Can view menus
- [ ] Can sign in/sign up
- [ ] Can add items to cart
- [ ] Can place an order

### Native Features (if implemented):
- [ ] Camera works (if using)
- [ ] Network status detection
- [ ] Back button works
- [ ] Status bar looks good

---

## 🐛 If Something Doesn't Work

### App Crashes on Launch:
1. Open **Logcat** tab in Android Studio (bottom)
2. Look for red error messages
3. Check if Supabase URL is correct
4. Verify environment variables

### White Screen:
1. Open Chrome: `chrome://inspect`
2. Find your app
3. Click **"inspect"**
4. Check Console for errors

### Gradle Sync Failed:
1. **File** → **Invalidate Caches** → **Restart**
2. **File** → **Sync Project with Gradle Files**

---

## 🎯 Quick Commands

```bash
# Build and sync
npm run build && npx cap sync android

# Open in Android Studio
npm run cap:open:android

# Check connected devices
adb devices

# View logs
adb logcat | grep -i "foodclub"
```

---

## ✅ Ready to Test!

**Just run:**
```bash
npm run cap:open:android
```

Then follow the steps above! 🚀

**Need help?** Check `ANDROID_TESTING_GUIDE.md` for detailed troubleshooting.

