// Messages: family members send voice / text / photo; the chair plays them.
import {
  deleteDoc,
  doc,
  getDocs,
  limit as qLimit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import type { ChairMessage, MessageType, Unsubscribe } from '@/types';
import { requireUser, storage } from './firebase';
import { currentSenderName } from './auth';
import { messageDoc, messagesCol, photoPath, toMessage, voicePath } from './paths';

export const MAX_TEXT_LENGTH = 2000;

/** Reads a local file URI (file://, content://, blob:, data:) into a Blob. */
async function uriToBlob(uri: string): Promise<Blob> {
  try {
    const res = await fetch(uri);
    if (!res.ok && res.status !== 0) throw new Error(`HTTP ${res.status}`);
    return await res.blob();
  } catch (fetchErr) {
    // Fallback for RN versions where fetch() can't read some local URIs.
    return new Promise<Blob>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => resolve(xhr.response as Blob);
      xhr.onerror = () => reject(fetchErr instanceof Error ? fetchErr : new Error('Could not read file'));
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });
  }
}

function audioContentType(uri: string, blob: Blob): string {
  if (blob.type?.startsWith('audio/')) return blob.type;
  const lower = uri.toLowerCase().split('?')[0];
  if (lower.endsWith('.webm')) return 'audio/webm';
  if (lower.endsWith('.wav')) return 'audio/wav';
  if (lower.endsWith('.caf')) return 'audio/x-caf';
  if (lower.endsWith('.3gp')) return 'audio/3gpp';
  return 'audio/mp4'; // .m4a / .mp4 (expo-audio default on iOS & Android)
}

function imageContentType(blob: Blob): string {
  return blob.type?.startsWith('image/') ? blob.type : 'image/jpeg';
}

async function uploadMedia(path: string, uri: string, kind: 'audio' | 'image'): Promise<string> {
  const blob = await uriToBlob(uri);
  const contentType = kind === 'audio' ? audioContentType(uri, blob) : imageContentType(blob);
  const r = storageRef(storage, path);
  await uploadBytes(r, blob, { contentType });
  // Release native blob memory where supported (React Native).
  (blob as Blob & { close?: () => void }).close?.();
  return getDownloadURL(r);
}

async function writeMessage(
  chairId: string,
  msgId: string,
  type: MessageType,
  extra: Partial<Pick<ChairMessage, 'text' | 'mediaPath' | 'mediaUrl' | 'durationMs'>>,
): Promise<ChairMessage> {
  const user = requireUser();
  const msg: ChairMessage = {
    id: msgId,
    chairId,
    type,
    senderUid: user.uid,
    senderName: await currentSenderName(),
    createdAt: Date.now(),
    playedAt: null,
  };
  for (const [k, v] of Object.entries(extra)) if (v !== undefined) (msg as unknown as Record<string, unknown>)[k] = v;
  const { id: _id, ...data } = msg;
  await setDoc(messageDoc(chairId, msgId), data);
  return msg;
}

/** fileUri: local recording URI from expo-audio. */
export async function sendVoice(chairId: string, fileUri: string, durationMs: number): Promise<ChairMessage> {
  requireUser();
  const msgId = doc(messagesCol(chairId)).id;
  const path = voicePath(chairId, msgId);
  const mediaUrl = await uploadMedia(path, fileUri, 'audio');
  return writeMessage(chairId, msgId, 'voice', {
    mediaPath: path,
    mediaUrl,
    durationMs: Math.max(0, Math.round(durationMs)),
  });
}

export async function sendText(chairId: string, text: string): Promise<ChairMessage> {
  const clean = text.trim();
  if (!clean) throw new Error('Message is empty.');
  if (clean.length > MAX_TEXT_LENGTH) throw new Error(`Message is too long (max ${MAX_TEXT_LENGTH} characters).`);
  const msgId = doc(messagesCol(chairId)).id;
  return writeMessage(chairId, msgId, 'text', { text: clean });
}

/** imageUri: local image URI from expo-image-picker. */
export async function sendPhoto(chairId: string, imageUri: string, caption?: string): Promise<ChairMessage> {
  requireUser();
  const cap = caption?.trim();
  if (cap && cap.length > MAX_TEXT_LENGTH) throw new Error(`Caption is too long (max ${MAX_TEXT_LENGTH} characters).`);
  const msgId = doc(messagesCol(chairId)).id;
  const path = photoPath(chairId, msgId);
  const mediaUrl = await uploadMedia(path, imageUri, 'image');
  return writeMessage(chairId, msgId, 'photo', { mediaPath: path, mediaUrl, text: cap || undefined });
}

/** Deletes one of your own messages (and its media file, if any). */
export async function deleteMessage(chairId: string, message: Pick<ChairMessage, 'id' | 'mediaPath'>): Promise<void> {
  if (message.mediaPath) {
    await deleteObject(storageRef(storage, message.mediaPath)).catch((e) => {
      if ((e as { code?: string }).code !== 'storage/object-not-found') throw e;
    });
  }
  await deleteDoc(messageDoc(chairId, message.id));
}

/** Newest first, for the conversation/history list. */
export function subscribeMessages(chairId: string, cb: (msgs: ChairMessage[]) => void, limit = 50): Unsubscribe {
  const q = query(messagesCol(chairId), orderBy('createdAt', 'desc'), qLimit(limit));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map(toMessage)),
    (err) => { console.warn('[messages] subscribeMessages error', err); cb([]); },
  );
}

// ---------- Chair device side ----------

export async function markPlayed(chairId: string, messageId: string): Promise<void> {
  await updateDoc(messageDoc(chairId, messageId), { playedAt: Date.now() });
}

/** Unplayed messages, oldest first — the chair plays them in order. */
export function subscribeUnplayed(chairId: string, cb: (msgs: ChairMessage[]) => void): Unsubscribe {
  const q = query(messagesCol(chairId), where('playedAt', '==', null), orderBy('createdAt', 'asc'));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map(toMessage)),
    (err) => { console.warn('[messages] subscribeUnplayed error', err); },
  );
}

function latestPhotoQuery(chairId: string) {
  return query(messagesCol(chairId), where('type', '==', 'photo'), orderBy('createdAt', 'desc'), qLimit(1));
}

/** The most recent photo (or null). */
export function subscribeLatestPhoto(chairId: string, cb: (msg: ChairMessage | null) => void): Unsubscribe {
  return onSnapshot(
    latestPhotoQuery(chairId),
    (snap) => cb(snap.empty ? null : toMessage(snap.docs[0])),
    (err) => { console.warn('[messages] subscribeLatestPhoto error', err); },
  );
}

/** Start of the current local day, in millis. */
export function startOfLocalDay(now = new Date()): number {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

/** True if a photo was already sent to this chair today (local time), by anyone. */
export async function hasSentPhotoToday(chairId: string): Promise<boolean> {
  const snap = await getDocs(latestPhotoQuery(chairId));
  if (snap.empty) return false;
  return (snap.docs[0].data().createdAt ?? 0) >= startOfLocalDay();
}
