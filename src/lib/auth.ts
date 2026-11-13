// Family (sender) authentication: email/password accounts + users/{uid} profile.
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import type { UserProfile, Unsubscribe } from '@/types';
import { auth, requireUser } from './firebase';
import { toProfile, userDoc } from './paths';

async function loadOrCreateProfile(user: User, displayName?: string): Promise<UserProfile> {
  const ref = userDoc(user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return toProfile(user.uid, snap.data(), user.displayName ?? '');
  const profile: UserProfile = {
    uid: user.uid,
    displayName: (displayName ?? user.displayName ?? user.email?.split('@')[0] ?? '').trim(),
    chairIds: [],
    createdAt: Date.now(),
  };
  await setDoc(ref, profile);
  return profile;
}

export async function signUp(email: string, password: string, displayName: string): Promise<UserProfile> {
  const name = displayName.trim();
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  if (name) await updateProfile(cred.user, { displayName: name });
  return loadOrCreateProfile(cred.user, name);
}

export async function signIn(email: string, password: string): Promise<UserProfile> {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  return loadOrCreateProfile(cred.user);
}

export async function signOut(): Promise<void> {
  await fbSignOut(auth);
}

/**
 * Emits the signed-in family user's profile (live: updates when chairIds or the
 * name change), or null when signed out. The anonymous chair-device user is
 * reported as null — it is not a family account.
 */
export function onAuthChanged(cb: (user: UserProfile | null) => void): Unsubscribe {
  let unsubProfile: Unsubscribe | null = null;
  const stopProfile = () => { unsubProfile?.(); unsubProfile = null; };

  const unsubAuth = onAuthStateChanged(auth, (user) => {
    stopProfile();
    if (!user || user.isAnonymous) { cb(null); return; }
    const fallback = toProfile(user.uid, undefined, user.displayName ?? '');
    unsubProfile = onSnapshot(
      userDoc(user.uid),
      (snap) => cb(snap.exists() ? toProfile(user.uid, snap.data(), user.displayName ?? '') : fallback),
      (err) => { console.warn('[auth] profile listener error', err); cb(fallback); },
    );
  });

  return () => { stopProfile(); unsubAuth(); };
}

export async function updateDisplayName(name: string): Promise<void> {
  const user = requireUser();
  const clean = name.trim();
  await updateProfile(user, { displayName: clean });
  const ref = userDoc(user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) await updateDoc(ref, { displayName: clean });
  else await loadOrCreateProfile(user, clean);
}

/** Display name used as senderName on outgoing messages. */
export async function currentSenderName(): Promise<string> {
  const user = requireUser();
  try {
    const snap = await getDoc(userDoc(user.uid));
    const n = snap.data()?.displayName;
    if (typeof n === 'string' && n) return n;
  } catch { /* fall through */ }
  return user.displayName ?? user.email?.split('@')[0] ?? 'Family';
}
