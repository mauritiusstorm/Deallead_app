import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.deallead.app',
  appName: 'Deallead',
  webDir: 'dist',
  backgroundColor: '#ffffff',
  server: {
    // During native development, point at the Vite dev server for
    // instant reload instead of the bundled `dist/` output:
    //   npx cap run android --livereload --external
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#ffffff',
      overlaysWebView: false,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
}

export default config
