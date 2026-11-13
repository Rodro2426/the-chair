// iOS/Android Auth initialisation with AsyncStorage persistence, so the family
// login and the chair device's anonymous uid survive app restarts.
// `getReactNativePersistence` is only exported by the "react-native" build of
// @firebase/auth, which Metro (and tsc via customConditions) resolves here.
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FirebaseApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth, type Auth } from 'firebase/auth';

export function createAuth(app: FirebaseApp): Auth {
  try {
    return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    // Already initialised (e.g. fast refresh).
    return getAuth(app);
  }
}
