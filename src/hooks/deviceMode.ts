import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Remembers which role this device plays. When set to 'chair', the app entry (src/app/index.tsx)
 * goes straight to /chair on launch. The chair screens can call setDeviceMode(null) to undo.
 */
const KEY = 'thechair.deviceMode';
export type DeviceMode = 'chair' | 'family';

export async function getDeviceMode(): Promise<DeviceMode | null> {
  try { return (await AsyncStorage.getItem(KEY)) as DeviceMode | null; } catch { return null; }
}
export async function setDeviceMode(mode: DeviceMode | null) {
  try { if (mode) await AsyncStorage.setItem(KEY, mode); else await AsyncStorage.removeItem(KEY); } catch {}
}
