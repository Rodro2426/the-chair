// Web (and default) Auth initialisation. Metro picks authInit.native.ts on iOS/Android.
import type { FirebaseApp } from 'firebase/app';
import { browserLocalPersistence, getAuth, initializeAuth, type Auth } from 'firebase/auth';

export function createAuth(app: FirebaseApp): Auth {
  try {
    return initializeAuth(app, { persistence: browserLocalPersistence });
  } catch {
    // Already initialised (e.g. fast refresh).
    return getAuth(app);
  }
}
