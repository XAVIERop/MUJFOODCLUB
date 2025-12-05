# 📱 Native Features Implementation Guide

## 🔔 Push Notifications (Firebase Cloud Messaging)

### Setup Steps

1. **Create Firebase Project:**
   - Go to https://console.firebase.google.com
   - Create project: "MUJ Food Club"
   - Enable Cloud Messaging

2. **Add iOS App:**
   - Click "Add app" → iOS
   - Bundle ID: `in.mujfoodclub.app`
   - Download `GoogleService-Info.plist`
   - Place in: `ios/App/App/GoogleService-Info.plist`

3. **Add Android App:**
   - Click "Add app" → Android
   - Package name: `in.mujfoodclub.app`
   - Download `google-services.json`
   - Place in: `android/app/google-services.json`

4. **Install Firebase Plugin:**
```bash
npm install @capacitor-firebase/messaging
npx cap sync
```

5. **Configure iOS (in Xcode):**
   - Add GoogleService-Info.plist to project
   - Enable Push Notifications capability
   - Add APNs certificate to Firebase

6. **Configure Android:**
   - Add google-services.json
   - Update `android/app/build.gradle`:
   ```gradle
   apply plugin: 'com.google.gms.google-services'
   ```

---

## 📷 Camera Integration

### Usage Example

```typescript
import { CameraService } from '@/services/capacitorService';

// Take photo
const photo = await CameraService.takePhoto({
  quality: 90,
  allowEditing: false
});

// Pick from gallery
const galleryPhoto = await CameraService.pickPhoto();
```

### Where to Use

1. **Profile Photo Upload**
   - Replace file input with camera
   - Better UX on mobile

2. **QR Code Scanning**
   - Use camera for table QR codes
   - Faster than typing table numbers

3. **Menu Item Photos (Cafes)**
   - Allow cafes to upload item photos
   - Use camera directly

---

## 📶 Network Status

### Usage

```typescript
import { NetworkService } from '@/services/capacitorService';

// Check if online
const isOnline = await NetworkService.isOnline();

// Listen for changes
const unsubscribe = NetworkService.onStatusChange((status) => {
  console.log('Network:', status.connected ? 'Online' : 'Offline');
});
```

### Implementation Ideas

1. **Offline Order Queue**
   - Queue orders when offline
   - Sync when back online

2. **Connection Status Indicator**
   - Show banner when offline
   - Disable actions that require internet

---

## 🎯 Haptic Feedback

### Usage

```typescript
import { HapticsService } from '@/services/capacitorService';

// On button press
await HapticsService.lightImpact();

// On success
await HapticsService.notificationSuccess();

// On error
await HapticsService.notificationError();
```

### Where to Add

- Button clicks
- Order confirmation
- Error states
- Success actions

---

## 📤 Share Functionality

### Usage

```typescript
import { ShareService } from '@/services/capacitorService';

// Share order
await ShareService.share({
  title: 'Check out my order!',
  text: 'I just ordered from Chatkara',
  url: 'https://mujfoodclub.in/order/123'
});
```

### Use Cases

- Share order details
- Share cafe menu
- Share referral codes
- Share app with friends

---

## 🎨 Status Bar Styling

### Usage

```typescript
import { StatusBarService } from '@/services/capacitorService';

// Set dark style
await StatusBarService.setStyle('dark');

// Set background color (Android)
await StatusBarService.setBackgroundColor('#ffffff');
```

---

## 📱 App Lifecycle

### Usage

```typescript
import { AppService } from '@/services/capacitorService';

// Listen for app state changes
const unsubscribe = AppService.onAppStateChange((state) => {
  if (state.isActive) {
    // App came to foreground - refresh data
    refreshOrders();
  } else {
    // App went to background - save state
    saveState();
  }
});
```

---

## 🔄 Migration from Web to Native

### Current Web Features → Native Equivalents

| Web Feature | Native Replacement |
|------------|-------------------|
| OneSignal | Firebase Cloud Messaging |
| File Input | Camera Plugin |
| Navigator.onLine | Network Plugin |
| Web Share API | Share Plugin |
| - | Haptics (new) |
| - | App Lifecycle (new) |

---

## 📝 Next Implementation Steps

1. **Replace OneSignal with Firebase:**
   - Install `@capacitor-firebase/messaging`
   - Create push notification service
   - Update order notification code

2. **Add Camera to Profile:**
   - Replace file input with camera button
   - Use CameraService

3. **Add Network Status UI:**
   - Show offline banner
   - Queue orders when offline

4. **Add Haptic Feedback:**
   - Add to button clicks
   - Add to order confirmations

5. **Test on Real Devices:**
   - iOS device
   - Android device

---

**Ready to implement these features?** Let me know which one to start with! 🚀

