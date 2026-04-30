import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.elibrary.app',
  appName: 'E-Library',
  webDir: 'build',
  android: {
    allowMixedContent: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    CapacitorCookies: {
      enabled: true,
    },
  }
};

export default config;
