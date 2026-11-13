// Firebase's package.json lists the public "types" entry before the "react-native"
// condition, so tsc never sees getReactNativePersistence even though Metro bundles
// the React Native build of @firebase/auth (which exports it) on iOS/Android.
import type { Persistence, ReactNativeAsyncStorage } from '@firebase/auth';

declare module '@firebase/auth' {
  export function getReactNativePersistence(storage: ReactNativeAsyncStorage): Persistence;
}
