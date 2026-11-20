// Voice recordings and photos stored directly in Firestore (no Cloud Storage / Blaze plan needed).
//
// A file is base64-encoded and split into chunk documents:
//   chairs/{chairId}/media/{msgId}_{i}   -> { msgId, i, n, mime, data, senderUid }
// The message's `mediaUrl` is then "fs:<n>:<mime>". Readers call resolveMediaUrl() to get
// something playable/displayable (an object URL on web, a data: URI on iOS/Android).
// Messages whose mediaUrl is a normal https URL (Cloud Storage) keep working unchanged.
import { Platform } from 'react-native';
import { doc, getDoc, type WriteBatch } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import type { ChairMessage } from '@/types';
import { db } from './firebase';

export const CHUNK_CHARS = 900_000; // < 1 MiB Firestore document limit, with room for other fields
export const MAX_CHUNKS = 9; // one write batch stays well under Firestore's 10 MiB request limit
const PREFIX = 'fs:';

const chunkDoc = (chairId: string, msgId: string, i: number) => doc(db, 'chairs', chairId, 'media', `${msgId}_${i}`);

export const isFirestoreMedia = (url?: string | null) => !!url && url.startsWith(PREFIX);

/** Reads a Blob into base64 (no data: prefix). Works on web and React Native. */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(r.error ?? new Error('Could not read file'));
    r.onload = () => {
      const s = String(r.result ?? '');
      resolve(s.slice(s.indexOf(',') + 1));
    };
    r.readAsDataURL(blob);
  });
}

/**
 * Adds the chunk documents for `blob` to `batch` and returns the mediaUrl to store on the message.
 * Throws a friendly error if the file is too large.
 */
export async function addMediaToBatch(
  batch: WriteBatch, chairId: string, msgId: string, senderUid: string, blob: Blob, mime: string,
): Promise<string> {
  const b64 = await blobToBase64(blob);
  const n = Math.max(1, Math.ceil(b64.length / CHUNK_CHARS));
  if (n > MAX_CHUNKS) throw new Error('That file is too large to send. Try a shorter message or a smaller photo.');
  const cleanMime = mime.replace(/[^\w/.+;=-]/g, '').slice(0, 100) || 'application/octet-stream';
  for (let i = 0; i < n; i++) {
    batch.set(chunkDoc(chairId, msgId, i), {
      msgId, i, n, mime: cleanMime, senderUid, data: b64.slice(i * CHUNK_CHARS, (i + 1) * CHUNK_CHARS),
    });
  }
  return `${PREFIX}${n}:${cleanMime}`;
}

/** Adds deletes for a message's chunk docs (used when a sender deletes their message). */
export function deleteMediaInBatch(batch: WriteBatch, chairId: string, msg: Pick<ChairMessage, 'id' | 'mediaUrl'>) {
  if (!isFirestoreMedia(msg.mediaUrl)) return;
  const n = Number(msg.mediaUrl!.slice(PREFIX.length).split(':')[0]) || 0;
  for (let i = 0; i < n; i++) batch.delete(chunkDoc(chairId, msg.id, i));
}

const cache = new Map<string, Promise<string>>();

/** A URL that <Image>/<audio>/expo-audio can open, or undefined if the message has no media. */
export function resolveMediaUrl(msg: Pick<ChairMessage, 'id' | 'chairId' | 'mediaUrl'>): Promise<string | undefined> {
  const url = msg.mediaUrl;
  if (!url) return Promise.resolve(undefined);
  if (!isFirestoreMedia(url)) return Promise.resolve(url);
  const key = `${msg.chairId}/${msg.id}`;
  let p = cache.get(key);
  if (!p) {
    p = loadChunks(msg.chairId, msg.id, url);
    p.catch(() => cache.delete(key)); // allow a retry later
    cache.set(key, p);
  }
  return p;
}

async function loadChunks(chairId: string, msgId: string, url: string): Promise<string> {
  const [nStr, ...mimeParts] = url.slice(PREFIX.length).split(':');
  const n = Number(nStr) || 0;
  const mime = mimeParts.join(':') || 'application/octet-stream';
  const snaps = await Promise.all(Array.from({ length: n }, (_, i) => getDoc(chunkDoc(chairId, msgId, i))));
  const b64 = snaps.map((s, i) => {
    const d = s.data()?.data;
    if (typeof d !== 'string') throw new Error(`media chunk ${i + 1}/${n} missing`);
    return d;
  }).join('');
  if (Platform.OS === 'web') {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return URL.createObjectURL(new Blob([bytes], { type: mime.split(';')[0] }));
  }
  return `data:${mime.split(';')[0]};base64,${b64}`;
}

/** Hook form of resolveMediaUrl for images and players. */
export function useMediaUrl(msg: Pick<ChairMessage, 'id' | 'chairId' | 'mediaUrl'> | null | undefined): string | undefined {
  const direct = msg?.mediaUrl && !isFirestoreMedia(msg.mediaUrl) ? msg.mediaUrl : undefined;
  const [resolved, setResolved] = useState<{ key: string; url?: string }>();
  const key = msg ? `${msg.chairId}/${msg.id}` : '';
  useEffect(() => {
    if (!msg || direct || !msg.mediaUrl) return;
    let alive = true;
    resolveMediaUrl(msg).then((url) => alive && setResolved({ key, url })).catch((e) => console.warn('[media] load failed', e));
    return () => { alive = false; };
  }, [key, direct, msg?.mediaUrl]); // eslint-disable-line react-hooks/exhaustive-deps
  if (direct) return direct;
  return resolved?.key === key ? resolved.url : undefined;
}

/** Web: shrink a picked photo to at most `max` px on the long side as JPEG (keeps uploads small). */
export async function shrinkImageForUpload(blob: Blob, max = 1600, quality = 0.8): Promise<Blob> {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return blob;
  try {
    const url = URL.createObjectURL(blob);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('image decode failed'));
      i.src = url;
    });
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * scale), h = Math.round(img.naturalHeight * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
    URL.revokeObjectURL(url);
    const out = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', quality));
    return out && out.size < blob.size ? out : blob;
  } catch {
    return blob;
  }
}
