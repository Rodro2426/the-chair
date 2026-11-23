// Public API used by the UI. Signatures are the contract; implementations live in
// the sibling modules (auth.ts, chair.ts, messages.ts) and are re-exported here.
export { resolveMediaUrl, useMediaUrl } from './media';
export { signUp, signIn, signOut, onAuthChanged, updateDisplayName } from './auth';

export {
  registerChairDevice,
  getMyChairDevice,
  startPairing,
  stopPairing,
  heartbeat,
  subscribeChair,
  linkChairWithCode,
  unlinkChair,
  subscribeMyChairs,
  setChairVolume,
  renameChair,
  PAIR_CODE_TTL_MS,
} from './chair';

export {
  markPlayed,
  markReplyHeard,
  subscribeUnplayed,
  subscribeLatestPhoto,
  subscribePhotos,
  sendVoice,
  sendText,
  sendPhoto,
  deleteMessage,
  subscribeMessages,
  hasSentPhotoToday,
  startOfLocalDay,
  MAX_TEXT_LENGTH,
} from './messages';
