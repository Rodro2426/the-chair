// Firestore / Storage paths and snapshot converters shared by the backend modules.
import { collection, doc, type DocumentData, type DocumentSnapshot, type QueryDocumentSnapshot } from 'firebase/firestore';
import type { Chair, ChairMessage, UserProfile } from '@/types';
import { db } from './firebase';

export const userDoc = (uid: string) => doc(db, 'users', uid);
export const chairDoc = (chairId: string) => doc(db, 'chairs', chairId);
export const chairsCol = () => collection(db, 'chairs');
export const messagesCol = (chairId: string) => collection(db, 'chairs', chairId, 'messages');
export const messageDoc = (chairId: string, msgId: string) => doc(db, 'chairs', chairId, 'messages', msgId);
export const pairCodeDoc = (code: string) => doc(db, 'pairCodes', code);

export const voicePath = (chairId: string, msgId: string) => `chairs/${chairId}/voice/${msgId}.m4a`;
export const photoPath = (chairId: string, msgId: string) => `chairs/${chairId}/photos/${msgId}.jpg`;

export function toChair(snap: DocumentSnapshot<DocumentData> | QueryDocumentSnapshot<DocumentData>): Chair {
  const d = snap.data() ?? {};
  return {
    id: snap.id,
    name: d.name ?? '',
    deviceUid: d.deviceUid ?? '',
    memberUids: Array.isArray(d.memberUids) ? d.memberUids : [],
    pairCode: d.pairCode ?? null,
    pairCodeExpiresAt: d.pairCodeExpiresAt ?? null,
    volume: typeof d.volume === 'number' ? d.volume : 1,
    lastSeenAt: d.lastSeenAt ?? null,
    createdAt: d.createdAt ?? 0,
  };
}

export function toMessage(snap: DocumentSnapshot<DocumentData> | QueryDocumentSnapshot<DocumentData>): ChairMessage {
  const d = snap.data() ?? {};
  const m: ChairMessage = {
    id: snap.id,
    chairId: d.chairId,
    type: d.type,
    senderUid: d.senderUid,
    senderName: d.senderName ?? '',
    createdAt: d.createdAt ?? 0,
    playedAt: d.playedAt ?? null,
  };
  if (d.text != null) m.text = d.text;
  if (d.mediaPath != null) m.mediaPath = d.mediaPath;
  if (d.mediaUrl != null) m.mediaUrl = d.mediaUrl;
  if (d.durationMs != null) m.durationMs = d.durationMs;
  return m;
}

export function toProfile(uid: string, d: DocumentData | undefined, fallbackName = ''): UserProfile {
  return {
    uid,
    displayName: d?.displayName ?? fallbackName,
    chairIds: Array.isArray(d?.chairIds) ? d!.chairIds : [],
    createdAt: d?.createdAt ?? 0,
  };
}
