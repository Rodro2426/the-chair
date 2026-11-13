// Single place where the Firebase app and its services are created.
import { getApp, getApps, initializeApp } from 'firebase/app';
import { initializeFirestore, getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { firebaseConfig } from './firebaseConfig';
import { createAuth } from './authInit';

const isFirstInit = getApps().length === 0;
export const app = isFirstInit ? initializeApp(firebaseConfig) : getApp();

export const auth = createAuth(app);

function createDb(): Firestore {
  if (!isFirstInit) return getFirestore(app);
  try {
    return initializeFirestore(app, { ignoreUndefinedProperties: true });
  } catch {
    return getFirestore(app);
  }
}
export const db = createDb();

export const storage = getStorage(app);

/** Resolves once Firebase has restored any persisted session. */
export async function authReady(): Promise<void> {
  await auth.authStateReady();
}

export function requireUser() {
  const u = auth.currentUser;
  if (!u) throw new Error('Not signed in');
  return u;
}
