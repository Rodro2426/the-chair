// Shared data contract for The Chair. All agents code against this file.
// Firestore layout:
//   users/{uid}                         -> UserProfile
//   chairs/{chairId}                    -> Chair
//   chairs/{chairId}/messages/{msgId}   -> ChairMessage
//   pairCodes/{code}                    -> PairCode   (6-digit code -> chairId)
// Storage layout:
//   chairs/{chairId}/voice/{msgId}.m4a
//   chairs/{chairId}/photos/{msgId}.jpg

export type Millis = number;

export interface UserProfile {
  uid: string;
  displayName: string; // e.g. "Santi" — shown to grandparent as "Message from Santi"
  chairIds: string[];
  createdAt: Millis;
}

export interface Chair {
  id: string;
  name: string; // grandparent's name, e.g. "Grandma Rosa"
  deviceUid: string; // anonymous auth uid of the chair/receiver device
  memberUids: string[]; // family members allowed to send
  pairCode: string | null; // current 6-digit code shown on the chair, null when not pairing
  pairCodeExpiresAt: Millis | null;
  volume: number; // 0..1, playback volume on the chair
  lastSeenAt: Millis | null; // heartbeat from chair device
  createdAt: Millis;
}

export type MessageType = 'voice' | 'text' | 'photo';

export interface ChairMessage {
  id: string;
  chairId: string;
  type: MessageType;
  senderUid: string;
  senderName: string;
  text?: string; // text messages (read aloud with TTS) and optional photo caption
  mediaPath?: string; // Storage path for voice/photo
  mediaUrl?: string; // download URL for voice/photo
  durationMs?: number; // voice length
  createdAt: Millis;
  playedAt?: Millis | null; // set by the chair once played / displayed
}

export interface PairCode {
  code: string;
  chairId: string;
  expiresAt: Millis;
}

export type Unsubscribe = () => void;
