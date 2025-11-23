# Debug OneSignal - Console Commands

## Run these in browser console to find the correct API:

```javascript
// 1. Check what's available on window.OneSignal
console.log('OneSignal object:', window.OneSignal);
console.log('OneSignal keys:', Object.keys(window.OneSignal || {}));

// 2. Check if User object exists
console.log('OneSignal.User:', window.OneSignal?.User);
console.log('User keys:', Object.keys(window.OneSignal?.User || {}));

// 3. Check for pushSubscription
console.log('User.pushSubscription:', window.OneSignal?.User?.pushSubscription);

// 4. Try to get ID from pushSubscription
if (window.OneSignal?.User?.pushSubscription) {
  window.OneSignal.User.pushSubscription.then(sub => {
    console.log('PushSubscription:', sub);
    console.log('Subscription ID:', sub?.id);
  });
}

// 5. Check for alternative methods
console.log('Has getPlayerId:', typeof window.OneSignal?.getPlayerId === 'function');
console.log('Has User.getOneSignalId:', typeof window.OneSignal?.User?.getOneSignalId === 'function');
console.log('Has User.getExternalId:', typeof window.OneSignal?.User?.getExternalId === 'function');

// 6. Check react-onesignal import
// This won't work in console, but check the code
```

## After running these, share the output so I can update the code accordingly!

