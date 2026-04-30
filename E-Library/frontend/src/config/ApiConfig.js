/**
 * API Configuration
 * Detects environment and sets correct API base URL
 * - Web: http://localhost:8080/api
 * - Android Emulator: http://10.0.2.2:8080/api
 * - Android Device: http://{DEVICE_IP}:8080/api (requires manual setup)
 * - Production: process.env.REACT_APP_API_URL
 */

let isNativePlatform = false;
let platformName = 'web';

// Detect Capacitor immediately on load
try {
  // Method 1: Try Capacitor standard global
  if (window.Capacitor) {
    isNativePlatform = window.Capacitor.isNativePlatform?.();
    platformName = window.Capacitor.getPlatform?.();
    console.log(`[API Config] Method 1 - Detected platform via window.Capacitor: ${platformName}, isNative: ${isNativePlatform}`);
  }
  // Method 2: Try CapacitorGlobal
  else if (window.CapacitorGlobal?.['CapacitorCoreJS']) {
    const Cap = window.CapacitorGlobal['CapacitorCoreJS'];
    isNativePlatform = Cap.isNativePlatform();
    platformName = Cap.getPlatform();
    console.log(`[API Config] Method 2 - Detected platform via CapacitorGlobal: ${platformName}, isNative: ${isNativePlatform}`);
  }
  
  // If still not detected, check if running in Android WebView by user agent
  if (!isNativePlatform && window.navigator?.userAgent?.includes('Android')) {
    console.log('[API Config] Detected Android via user agent');
    isNativePlatform = true;
    platformName = 'android';
  }
} catch (e) {
  console.log('[API Config] Capacitor detection error:', e.message);
}

export const isAndroid = () => {
  // Check if running in Capacitor (mobile app)
  const result = isNativePlatform && (platformName === 'android' || platformName?.toLowerCase?.()?.includes?.('android'));
  if (result) console.log('[API Config] Android detected');
  return result;
};

export const isAndroidEmulator = () => {
  const userAgent = window.navigator?.userAgent || '';
  // Check for emulator-specific strings ONLY — NOT generic "Linux" which appears in
  // every Android user agent (physical and emulator alike).
  const result = isAndroid() && (
    userAgent.includes('sdk_gphone') ||          // standard AVD model name
    userAgent.includes('Android SDK built for') || // x86/x86_64 AVD descriptor
    userAgent.includes('google_sdk') ||
    userAgent.includes('goldfish') ||              // QEMU goldfish kernel
    userAgent.includes('ranchu') ||                // newer QEMU kernel
    userAgent.toLowerCase().includes('emulator')
  );
  if (result) console.log('[API Config] Android Emulator detected - using 10.0.2.2');
  return result;
};

export const getApiUrl = () => {
  const userAgent = window.navigator?.userAgent || '';
  const location = window.location?.protocol || '';
  
  // Log all detection info
  console.log(`[API Config] Detection info - isNative: ${isNativePlatform}, platform: ${platformName}, userAgent includes Android: ${userAgent.includes('Android')}, location: ${location}`);
  
  // Android emulator - ALWAYS use 10.0.2.2 (host machine from emulator's perspective)
  // Check this BEFORE env vars so production URLs don't override local dev on emulator
  if (isAndroidEmulator()) {
    console.log('[API Config] Using emulator URL: http://10.0.2.2:4000/api');
    return 'http://10.0.2.2:4000/api';
  }

  // Android physical device — use localhost via USB ADB reverse tunnel
  // Run: adb reverse tcp:4000 tcp:4000 (forwards phone's localhost:4000 → PC's localhost:4000)
  // This works while the phone is connected via USB cable.
  if (isAndroid()) {
    const deviceIp = process.env.REACT_APP_DEVICE_IP || 'http://localhost:4000/api';
    console.log(`[API Config] Android Physical Device detected. Using: ${deviceIp}`);
    return deviceIp;
  }

  // Production environment (web only) - check for REACT_APP_API_BASE_URL or REACT_APP_API_URL
  if (process.env.REACT_APP_API_BASE_URL && !process.env.REACT_APP_API_BASE_URL.includes('localhost')) {
    const url = process.env.REACT_APP_API_BASE_URL.endsWith('/api') 
      ? process.env.REACT_APP_API_BASE_URL 
      : process.env.REACT_APP_API_BASE_URL + '/api';
    console.log(`[API Config] Using env REACT_APP_API_BASE_URL: ${url}`);
    return url;
  }
  if (process.env.REACT_APP_API_URL && !process.env.REACT_APP_API_URL.includes('localhost')) {
    console.log(`[API Config] Using env REACT_APP_API_URL: ${process.env.REACT_APP_API_URL}`);
    return process.env.REACT_APP_API_URL;
  }

  // Web development
  console.log('[API Config] Using web URL: http://localhost:8080/api');
  return 'http://localhost:8080/api';
};

export const API_BASE_URL = getApiUrl();

/**
 * Returns the base URL for the Python AI/Ranker service (port 5000).
 * Correctly handles all platforms (web, Android emulator, Android physical device).
 */
export const getRankerUrl = () => {
  // Explicit env override takes priority
  if (process.env.REACT_APP_RANKER_URL) {
    return process.env.REACT_APP_RANKER_URL;
  }

  // Android emulator — host machine is reachable via 10.0.2.2
  if (isAndroidEmulator()) {
    return 'http://10.0.2.2:5000/api';
  }

  // Android physical device — use device IP env var if set, else localhost (via ADB reverse)
  if (isAndroid()) {
    if (process.env.REACT_APP_DEVICE_IP) {
      // e.g. REACT_APP_DEVICE_IP=http://192.168.1.100:4000/api → strip path and port, use :5000
      try {
        const url = new URL(process.env.REACT_APP_DEVICE_IP);
        return `${url.protocol}//${url.hostname}:5000/api`;
      } catch (_) {}
    }
    // ADB reverse tunnel: run `adb reverse tcp:5000 tcp:5000` to make this work
    return 'http://localhost:5000/api';
  }

  // Web development
  return 'http://localhost:5000/api';
};

/**
 * Returns the Spring Boot backend URL (port 8080).
 * Always points to the Java backend, regardless of platform.
 * - Web: http://localhost:8080
 * - Android Emulator: http://10.0.2.2:8080 (host machine reachable via 10.0.2.2)
 * - Android Physical Device: http://10.0.2.2:8080 via ADB reverse (adb reverse tcp:8080 tcp:8080)
 */
export const getSpringBootUrl = () => {
  if (isAndroid()) {
    return 'http://10.0.2.2:8080';
  }
  return 'http://localhost:8080';
};

export default {
  API_BASE_URL,
  getApiUrl,
  getRankerUrl,
  getSpringBootUrl,
  isAndroid,
  isAndroidEmulator
};
