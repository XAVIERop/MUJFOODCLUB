# 🤖 Android Testing - Step by Step

## ✅ Setup Complete!

Your Android app is built and synced. Here's exactly what to do:

---

## 🚀 Step 1: Open Android Studio

**Run this:**
```bash
npm run cap:open:android
```

**OR manually:**
1. Open Android Studio
2. **File** → **Open**
3. Navigate to: `/Users/pv/MUJFOODCLUB/android`
4. Click **Open**

---

## ⏳ Step 2: Wait for Gradle Sync

**What you'll see:**
- Bottom status bar: "Gradle sync in progress..."
- This takes 2-5 minutes (first time)
- Wait until it says "Gradle sync completed"

**If sync fails:**
- **File** → **Invalidate Caches** → **Restart**
- Then **File** → **Sync Project with Gradle Files**

---

## 📱 Step 3: Set Up Device

### Option A: Use Emulator (Virtual Device)

1. Click **"Device Manager"** (top toolbar, phone icon)
2. Click **"Create Device"**
3. Choose a phone (e.g., **Pixel 7**)
4. Click **"Next"**
5. Download a system image (e.g., **API 34 - Android 14**)
6. Click **"Finish"**
7. Click **▶️ Play** button next to device to start it

### Option B: Use Real Phone

1. **Enable Developer Mode** on phone:
   - Settings → About Phone
   - Tap "Build Number" 7 times

2. **Enable USB Debugging:**
   - Settings → Developer Options
   - Enable "USB Debugging"

3. **Connect via USB:**
   - Plug phone into computer
   - Accept "Allow USB debugging?" on phone

4. **Verify in Android Studio:**
   - Device should appear in device dropdown (top toolbar)

---

## ▶️ Step 4: Run the App

1. **Select your device** from dropdown (top toolbar)
   - Should show your emulator or phone name

2. **Click the green Run button** (▶️) or press `Shift + F10`

3. **Wait for build:**
   - First build takes 2-5 minutes
   - You'll see progress in bottom status bar

4. **App launches!** 🎉

---

## 🧪 Step 5: Test Basic Features

### Quick Test Checklist:

1. **App Launches**
   - ✅ Opens without crash
   - ✅ Shows homepage

2. **Navigation**
   - ✅ Can click on cafes
   - ✅ Can view menus
   - ✅ Can go back

3. **Authentication**
   - ✅ Try signing in
   - ✅ Try signing up

4. **Ordering**
   - ✅ Add item to cart
   - ✅ Go to checkout
   - ✅ (Don't actually place order unless you want to test that)

---

## 🐛 Troubleshooting

### "SDK not found"
**Fix:**
1. Android Studio → **Tools** → **SDK Manager**
2. Install **Android SDK (API 33 or 34)**
3. Install **Android SDK Build-Tools**
4. Click **Apply**

### "Gradle sync failed"
**Fix:**
1. **File** → **Invalidate Caches** → **Restart**
2. Wait for sync to complete

### "Device not detected"
**Fix:**
```bash
# Check ADB
adb devices

# If empty, restart ADB
adb kill-server
adb start-server
```

### "App crashes on launch"
**Check:**
1. Open **Logcat** tab (bottom of Android Studio)
2. Look for red error messages
3. Check if Supabase URL is correct
4. Verify environment variables are set

### "White screen"
**Debug:**
1. Open Chrome: `chrome://inspect`
2. Find your app
3. Click **"inspect"**
4. Check Console tab for errors

---

## 📊 What to Look For

### ✅ Good Signs:
- App opens smoothly
- Homepage loads
- Navigation works
- No crashes
- Smooth scrolling

### ⚠️ Issues to Report:
- App crashes
- White screen
- Buttons don't work
- Can't sign in
- Network errors

---

## 🎯 Next Steps After Testing

Once everything works:
1. Test on multiple devices (if possible)
2. Test different screen sizes
3. Test on different Android versions
4. Prepare for production build
5. Set up app signing for Play Store

---

## 💡 Pro Tips

1. **Use Logcat** to see what's happening:
   - Bottom tab in Android Studio
   - Filter by "MUJ" or "Food Club"

2. **Use Chrome DevTools** for JavaScript debugging:
   - `chrome://inspect` in Chrome
   - Inspect your app

3. **Hot Reload:**
   - After making web changes:
   - `npm run build && npx cap sync android`
   - Then run again in Android Studio

---

## ✅ Ready!

**Just run:**
```bash
npm run cap:open:android
```

Then follow steps 2-5 above! 🚀

**Questions?** Check the logs in Logcat or Chrome DevTools!

