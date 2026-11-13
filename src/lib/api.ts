// Public API used by the UI. The BACKEND agent implements these (it may split the
// implementation into other files under src/lib/ and re-export from here), but the
// signatures below are the contract — change them only if strictly necessary, and
// then update every caller.
import type { Chair, ChairMessage, UserProfile, Unsubscribe } from '@/types';

const todo = (name: string): never => { throw new Error(`${name}: not implemented yet`); };

// ---------- Auth (family / sender) ----------
export async function signUp(email: string, password: string, displayName: string): Promise<UserProfile> { return todo('signUp'); }
export async function signIn(email: string, password: string): Promise<UserProfile> { return todo('signIn'); }
export async function signOut(): Promise<void> { return todo('signOut'); }
export function onAuthChanged(cb: (user: UserProfile | null) => void): Unsubscribe { return todo('onAuthChanged'); }
export async function updateDisplayName(name: string): Promise<void> { return todo('updateDisplayName'); }

// ---------- Chair device (receiver) ----------
/** Signs the device in anonymously and creates/loads its Chair doc. */
export async function registerChairDevice(grandparentName: string): Promise<Chair> { return todo('registerChairDevice'); }
/** Returns the chair owned by this device, if it was already registered. */
export async function getMyChairDevice(): Promise<Chair | null> { return todo('getMyChairDevice'); }
/** Generates a fresh 6-digit pairing code valid for 10 minutes. */
export async function startPairing(chairId: string): Promise<{ code: string; expiresAt: number }> { return todo('startPairing'); }
export async function heartbeat(chairId: string): Promise<void> { return todo('heartbeat'); }
export async function markPlayed(chairId: string, messageId: string): Promise<void> { return todo('markPlayed'); }
/** Unplayed messages, oldest first — the chair plays them in order. */
export function subscribeUnplayed(chairId: string, cb: (msgs: ChairMessage[]) => void): Unsubscribe { return todo('subscribeUnplayed'); }
/** The most recent photo of the day (or null). */
export function subscribeLatestPhoto(chairId: string, cb: (msg: ChairMessage | null) => void): Unsubscribe { return todo('subscribeLatestPhoto'); }

// ---------- Linking (family side) ----------
/** Family member enters the 6-digit code shown on the chair. */
export async function linkChairWithCode(code: string): Promise<Chair> { return todo('linkChairWithCode'); }
export async function unlinkChair(chairId: string): Promise<void> { return todo('unlinkChair'); }
export function subscribeMyChairs(cb: (chairs: Chair[]) => void): Unsubscribe { return todo('subscribeMyChairs'); }
export async function setChairVolume(chairId: string, volume: number): Promise<void> { return todo('setChairVolume'); }
export async function renameChair(chairId: string, name: string): Promise<void> { return todo('renameChair'); }

// ---------- Messages (family side) ----------
/** fileUri: local recording URI from expo-audio. */
export async function sendVoice(chairId: string, fileUri: string, durationMs: number): Promise<ChairMessage> { return todo('sendVoice'); }
export async function sendText(chairId: string, text: string): Promise<ChairMessage> { return todo('sendText'); }
/** imageUri: local image URI from expo-image-picker. */
export async function sendPhoto(chairId: string, imageUri: string, caption?: string): Promise<ChairMessage> { return todo('sendPhoto'); }
/** Newest first, for the conversation/history list. */
export function subscribeMessages(chairId: string, cb: (msgs: ChairMessage[]) => void, limit?: number): Unsubscribe { return todo('subscribeMessages'); }
/** True if a photo was already sent today (local time) — drives the "photo of the day" state. */
export async function hasSentPhotoToday(chairId: string): Promise<boolean> { return todo('hasSentPhotoToday'); }
