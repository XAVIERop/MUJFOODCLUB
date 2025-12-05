# 📱 Android Studio Setup Guide

## ⚠️ Android Studio Not Found

Android Studio needs to be installed to test your Android app.

---

## 📥 Install Android Studio

### Step 1: Download

1. Go to: https://developer.android.com/studio
2. Click **"Download Android Studio"**
3. Download for **macOS** (since you're on Mac)

### Step 2: Install

1. Open the downloaded `.dmg` file
2. Drag **Android Studio** to **Applications** folder
3. Open **Android Studio** from Applications

### Step 3: First Time Setup

1. **Welcome Screen:**
   - Click **"Next"**
   - Choose **"Standard"** installation
   - Click **"Next"** → **"Finish"**

2. **SDK Setup:**
   - Android Studio will download:
     - Android SDK
     - Android SDK Platform
     - Android Virtual Device
   - This takes 5-10 minutes
   - Wait for "Finish" button

3. **Create Project:**
   - Click **"New Project"**
   - Choose **"Empty Activity"**
   - Click **"Next"** → **"Finish"**
   - (We'll close this and open your project)

---

## 🚀 After Installation

### Open Your Project

**Option 1: Command Line**
```bash
# Set path if needed
export CAPACITOR_ANDROID_STUDIO_PATH="/Applications/Android Studio.app"

# Then open
npm run cap:open:android
```

**Option 2: Manual**
1. Open **Android Studio**
2. **File** → **Open**
3. Navigate to: `/Users/pv/MUJFOODCLUB/android`
4. Click **Open**

---

## ✅ Verify Installation

After installing, verify:

```bash
# Check if Android Studio is installed
ls -la "/Applications/Android Studio.app"

# Check Java (should already be installed)
java -version

# Check Android SDK (after Android Studio setup)
echo $ANDROID_HOME
```

---

## 🎯 Quick Start After Install

1. **Open Android Studio**
2. **File** → **Open** → Select `/Users/pv/MUJFOODCLUB/android`
3. Wait for Gradle sync
4. Create/Select device
5. Click **Run** (▶️)

---

## 📋 System Requirements

- **macOS 10.14 or later**
- **8 GB RAM minimum** (16 GB recommended)
- **2 GB disk space** for Android Studio
- **4 GB disk space** for Android SDK
- **Java 17+** (you have Java 20 ✅)

---

## ⏱️ Installation Time

- Download: 5-10 minutes
- Installation: 2-3 minutes
- First-time setup: 5-10 minutes
- **Total: ~20 minutes**

---

## 🆘 If Installation Fails

**Check:**
1. Enough disk space? (need ~6 GB free)
2. macOS version compatible?
3. Antivirus blocking?

**Try:**
1. Restart computer
2. Download again
3. Check Android Studio system requirements

---

## 🎉 After Installation

Once Android Studio is installed:

1. **Open your project:**
   ```bash
   npm run cap:open:android
   ```

2. **Follow the testing guide:**
   - See `ANDROID_TEST_STEPS.md`

---

**Ready to install?** Go to: https://developer.android.com/studio

Then come back and we'll test your app! 🚀

