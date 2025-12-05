import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.mujfoodclub.app',
  appName: 'MUJ Food Club',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    // Allow localhost in development
    ...(process.env.NODE_ENV === 'development' && {
      url: 'http://localhost:8080',
      cleartext: true,
    }),
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#ffffff',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    Camera: {
      permissions: {
        camera: 'Allow MUJ Food Club to access your camera for QR code scanning and photos.',
        photos: 'Allow MUJ Food Club to access your photos.',
      },
    },
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
  },
  android: {
    allowMixedContent: true,
    buildOptions: {
      keystorePath: undefined, // Set this when ready for production
      keystoreAlias: undefined,
    },
  },
};

export default config;

