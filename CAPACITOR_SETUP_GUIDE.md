# 📱 Capacitor Mobile App - Complete Setup Guide

## ✅ What's Done

1. ✅ Capacitor packages installed
2. ✅ Capacitor configuration created
3. ✅ Android platform added
4. ⚠️ iOS platform added (needs Xcode setup)

---

## 🚀 Next Steps

### Step 1: iOS Setup (Mac Only)

**Prerequisites:**
- Full Xcode installed (not just command line tools)
- Xcode Command Line Tools configured

**Install Xcode:**
```bash
# Install from App Store or:
xcode-select --install

# After installation, set Xcode path:
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

**Then sync iOS:**
```bash
npm run cap:sync
```

**Open in Xcode:**
```bash
npm run cap:open:ios
```

---

### Step 2: Android Setup

**Prerequisites:**
- Android Studio installed
- Java Development Kit (JDK) 17 or higher

**Open in Android Studio:**
```bash
npm run cap:open:android
```

**Or manually:**
1. Open Android Studio
2. File → Open → Select `android` folder
3. Wait for Gradle sync
4. Run on emulator or device

---

## 🔧 Development Workflow

### 1. Make Changes to Web App
```bash
npm run dev
# Make your changes in src/
```

### 2. Build for Mobile
```bash
npm run build
npm run cap:sync
```

### 3. Test on Device/Emulator

**iOS:**
```bash
npm run cap:open:ios
# Then run from Xcode
```

**Android:**
```bash
npm run cap:open:android
# Then run from Android Studio
```

---

## 📦 Native Features Setup

### Push Notifications (Firebase Cloud Messaging)

**1. Create Firebase Project:**
- Go to https://console.firebase.google.com
- Create new project: "MUJ Food Club"
- Add iOS app (get GoogleService-Info.plist)
- Add Android app (get google-services.json)

**2. Install Firebase:**
```bash
npm install @capacitor-firebase/messaging
```

**3. Configure:**
- iOS: Add GoogleService-Info.plist to `ios/App/App/`
- Android: Add google-services.json to `android/app/`

**4. Update code:**
- Use `@capacitor-firebase/messaging` instead of OneSignal
- I'll create a service wrapper for this

---

### Camera Setup

Already configured! Just use:
```typescript
import { Camera } from '@capacitor/camera';

const photo = await Camera.getPhoto({
  quality: 90,
  allowEditing: false,
  resultType: 'base64'
});
```

---

### Network Status

Already configured! Use:
```typescript
import { Network } from '@capacitor/network';

const status = await Network.getStatus();
console.log('Network status:', status.connected);
```

---

## 🎨 App Icons & Splash Screens

### Generate Icons

**Option 1: Use Capacitor Assets**
```bash
npm install -g @capacitor/assets
npx capacitor-assets generate
```

**Option 2: Manual Setup**

1. Create icons:
   - iOS: 1024x1024px PNG
   - Android: 512x512px PNG

2. Place in:
   - iOS: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
   - Android: `android/app/src/main/res/` (various mipmap folders)

3. Create splash screens:
   - iOS: `ios/App/App/Assets.xcassets/Splash.imageset/`
   - Android: `android/app/src/main/res/drawable/`

---

## 🔔 Push Notifications Setup

### Firebase Cloud Messaging (Recommended)

**Why Firebase over OneSignal?**
- Better native integration
- Free tier is generous
- Works seamlessly with Capacitor
- Better delivery rates

**Setup Steps:**

1. **Create Firebase Project** (if not exists)
2. **Enable Cloud Messaging:**
   - Firebase Console → Project Settings → Cloud Messaging
   - Enable for iOS and Android

3. **Install Plugin:**
```bash
npm install @capacitor-firebase/messaging
npx cap sync
```

4. **Configure:**
   - iOS: Add APNs certificate to Firebase
   - Android: Add google-services.json

5. **Update Code:**
   - I'll create a native push notification service
   - Replace OneSignal calls with Firebase

---

## 📱 Testing on Real Devices

### iOS

1. **Connect iPhone via USB**
2. **Trust computer on iPhone**
3. **Open Xcode:**
   ```bash
   npm run cap:open:ios
   ```
4. **Select your device** in Xcode
5. **Click Run** (▶️)

**Note:** You need:
- Apple Developer account (free for testing)
- Device registered in Xcode

### Android

1. **Enable Developer Options** on Android device:
   - Settings → About Phone → Tap "Build Number" 7 times
2. **Enable USB Debugging:**
   - Settings → Developer Options → USB Debugging
3. **Connect device via USB**
4. **Open Android Studio:**
   ```bash
   npm run cap:open:android
   ```
5. **Select device** and click Run

---

## 🏪 App Store Submission

### iOS (App Store)

**Requirements:**
- Apple Developer Program ($99/year)
- App Store Connect account
- App icons and screenshots
- Privacy policy URL
- App description

**Steps:**
1. Build archive in Xcode
2. Upload to App Store Connect
3. Submit for review

### Android (Google Play)

**Requirements:**
- Google Play Developer account ($25 one-time)
- App signing key
- App icons and screenshots
- Privacy policy URL
- App description

**Steps:**
1. Build signed APK/AAB in Android Studio
2. Upload to Google Play Console
3. Submit for review

---

## 🔄 Continuous Updates

**After making web changes:**

1. Build web app:
   ```bash
   npm run build
   ```

2. Sync to native:
   ```bash
   npm run cap:sync
   ```

3. Test and rebuild native apps

**Note:** Native code changes require rebuilding in Xcode/Android Studio

---

## 🐛 Troubleshooting

### iOS Issues

**"xcodebuild requires Xcode"**
- Install full Xcode from App Store
- Run: `sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer`

**CocoaPods not found**
```bash
sudo gem install cocoapods
cd ios/App
pod install
```

### Android Issues

**Gradle sync failed**
- Open Android Studio
- File → Invalidate Caches → Restart
- File → Sync Project with Gradle Files

**Build failed**
- Check Java version: `java -version` (should be 17+)
- Update Android SDK in Android Studio

---

## 📚 Next Steps

1. ✅ Set up Firebase for push notifications
2. ✅ Create native service wrappers
3. ✅ Test on real devices
4. ✅ Generate app icons
5. ✅ Prepare for store submission

---

## 🎯 Current Status

- ✅ Capacitor installed and configured
- ✅ Android platform ready
- ⚠️ iOS needs Xcode setup
- ⏳ Push notifications (Firebase setup needed)
- ⏳ App icons (need to create)
- ⏳ Testing on devices

---

**Ready to continue?** Let me know when you have:
1. Xcode installed (for iOS)
2. Android Studio installed (for Android)
3. Firebase project created (for push notifications)

Then I'll help you set up the native features! 🚀

