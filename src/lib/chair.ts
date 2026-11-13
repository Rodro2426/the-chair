// Chair device (receiver) and family-side linking / chair settings.
import { signInAnonymously, signOut as fbSignOut } from 'firebase/auth';
import {
  arrayRemove,
  arrayUnion,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import type { Chair, PairCode, Unsubscribe } from '@/types';
import { auth, authReady, db, requireUser } from './firebase';
import { chairDoc, chairsCol, pairCodeDoc, toChair, userDoc } from './paths';

export const PAIR_CODE_TTL_MS = 10 * 60 * 1000;

function randomCode(): string {
  const c = (globalThis as { crypto?: { getRandomValues?: (a: Uint32Array) => Uint32Array } }).crypto;
  let n: number;
  if (c?.getRandomValues) n = c.getRandomValues(new Uint32Array(1))[0] % 1_000_000;
  else n = Math.floor(Math.random() * 1_000_000);
  return String(n).padStart(6, '0');
}

function requireFamilyUser() {
  const u = requireUser();
  if (u.isAnonymous) throw new Error('Please sign in with your family account first.');
  return u;
}

// ---------- Chair device ----------

/**
 * Signs the device in anonymously and creates/loads its Chair doc.
 * The chair id is the device's anonymous uid (one chair per device).
 * If a family account is signed in on this device it is signed out first —
 * the chair tablet is a dedicated device.
 */
export async function registerChairDevice(grandparentName: string): Promise<Chair> {
  await authReady();
  if (auth.currentUser && !auth.currentUser.isAnonymous) await fbSignOut(auth);
  const user = auth.currentUser ?? (await signInAnonymously(auth)).user;
  const ref = chairDoc(user.uid);
  const name = grandparentName.trim();

  const snap = await getDoc(ref);
  if (snap.exists()) {
    const chair = toChair(snap);
    if (name && name !== chair.name) {
      await updateDoc(ref, { name });
      chair.name = name;
    }
    return chair;
  }

  const chair: Chair = {
    id: user.uid,
    name,
    deviceUid: user.uid,
    memberUids: [],
    pairCode: null,
    pairCodeExpiresAt: null,
    volume: 1,
    lastSeenAt: Date.now(),
    createdAt: Date.now(),
  };
  const { id: _id, ...data } = chair;
  await setDoc(ref, data);
  return chair;
}

/** Returns the chair owned by this device, if it was already registered. */
export async function getMyChairDevice(): Promise<Chair | null> {
  await authReady();
  const user = auth.currentUser;
  if (!user || !user.isAnonymous) return null;
  const snap = await getDoc(chairDoc(user.uid));
  return snap.exists() ? toChair(snap) : null;
}

/** Generates a fresh 6-digit pairing code valid for 10 minutes. */
export async function startPairing(chairId: string): Promise<{ code: string; expiresAt: number }> {
  requireUser();
  const chairSnap = await getDoc(chairDoc(chairId));
  if (!chairSnap.exists()) throw new Error('Chair not found');
  const oldCode = toChair(chairSnap).pairCode;

  const now = Date.now();
  let code = '';
  for (let i = 0; i < 8; i++) {
    const candidate = randomCode();
    if (candidate === oldCode) continue;
    const existing = await getDoc(pairCodeDoc(candidate));
    const d = existing.data() as PairCode | undefined;
    if (!d || d.chairId === chairId || d.expiresAt < now) { code = candidate; break; }
  }
  if (!code) throw new Error('Could not generate a pairing code, please try again.');

  const expiresAt = now + PAIR_CODE_TTL_MS;
  const batch = writeBatch(db);
  batch.set(pairCodeDoc(code), { code, chairId, expiresAt } satisfies PairCode);
  batch.update(chairDoc(chairId), { pairCode: code, pairCodeExpiresAt: expiresAt });
  if (oldCode) {
    const old = await getDoc(pairCodeDoc(oldCode)).catch(() => null);
    if (old?.exists() && old.data().chairId === chairId) batch.delete(pairCodeDoc(oldCode));
  }
  await batch.commit();
  return { code, expiresAt };
}

/** Clears the current pairing code (e.g. once a family member has linked). */
export async function stopPairing(chairId: string): Promise<void> {
  const chairSnap = await getDoc(chairDoc(chairId));
  const oldCode = chairSnap.exists() ? toChair(chairSnap).pairCode : null;
  const batch = writeBatch(db);
  batch.update(chairDoc(chairId), { pairCode: null, pairCodeExpiresAt: null });
  if (oldCode) {
    const old = await getDoc(pairCodeDoc(oldCode)).catch(() => null);
    if (old?.exists() && old.data().chairId === chairId) batch.delete(pairCodeDoc(oldCode));
  }
  await batch.commit();
}

export async function heartbeat(chairId: string): Promise<void> {
  await updateDoc(chairDoc(chairId), { lastSeenAt: Date.now() });
}

/** Live view of a single chair (device: members/volume/pairing; family: status). */
export function subscribeChair(chairId: string, cb: (chair: Chair | null) => void): Unsubscribe {
  return onSnapshot(
    chairDoc(chairId),
    (snap) => cb(snap.exists() ? toChair(snap) : null),
    (err) => { console.warn('[chair] subscribeChair error', err); cb(null); },
  );
}

// ---------- Linking (family side) ----------

/** Family member enters the 6-digit code shown on the chair. */
export async function linkChairWithCode(code: string): Promise<Chair> {
  const user = requireFamilyUser();
  const clean = code.replace(/\D/g, '');
  if (clean.length !== 6) throw new Error('The code has 6 digits.');

  const pcSnap = await getDoc(pairCodeDoc(clean));
  if (!pcSnap.exists()) throw new Error("That code doesn't match any chair. Check the code on the chair screen.");
  const pc = pcSnap.data() as PairCode;
  if (pc.expiresAt < Date.now()) throw new Error('That code has expired. Ask for a new code on the chair.');

  try {
    // Rules only allow this when joinCode equals the chair's live, unexpired pairCode.
    await updateDoc(chairDoc(pc.chairId), { memberUids: arrayUnion(user.uid), joinCode: clean });
  } catch (e) {
    const codeStr = (e as { code?: string }).code;
    if (codeStr === 'permission-denied') throw new Error('That code is no longer valid. Ask for a new code on the chair.');
    throw e;
  }
  await setDoc(userDoc(user.uid), { uid: user.uid, chairIds: arrayUnion(pc.chairId) }, { merge: true });
  const snap = await getDoc(chairDoc(pc.chairId));
  return toChair(snap);
}

export async function unlinkChair(chairId: string): Promise<void> {
  const user = requireFamilyUser();
  await updateDoc(chairDoc(chairId), { memberUids: arrayRemove(user.uid) });
  await setDoc(userDoc(user.uid), { chairIds: arrayRemove(chairId) }, { merge: true });
}

/** Chairs the signed-in family user is a member of, sorted by name. */
export function subscribeMyChairs(cb: (chairs: Chair[]) => void): Unsubscribe {
  const user = auth.currentUser;
  if (!user || user.isAnonymous) { cb([]); return () => {}; }
  const q = query(chairsCol(), where('memberUids', 'array-contains', user.uid));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map(toChair).sort((a, b) => a.name.localeCompare(b.name))),
    (err) => { console.warn('[chair] subscribeMyChairs error', err); cb([]); },
  );
}

export async function setChairVolume(chairId: string, volume: number): Promise<void> {
  const v = Math.min(1, Math.max(0, Number.isFinite(volume) ? volume : 1));
  await updateDoc(chairDoc(chairId), { volume: v });
}

export async function renameChair(chairId: string, name: string): Promise<void> {
  const clean = name.trim();
  if (!clean) throw new Error('Name cannot be empty.');
  await updateDoc(chairDoc(chairId), { name: clean });
}
