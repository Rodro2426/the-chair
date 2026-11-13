# The Chair — Backend (Firebase)

Firebase project: `the-chair-that-holds-a-story`. No Cloud Functions — everything is
client SDK (`firebase` v13) + security rules.

## Code layout (`src/lib/`)

| File | What |
| --- | --- |
| `firebaseConfig.ts` | Public web config (not a secret). |
| `firebase.ts` | Creates `app`, `auth`, `db` (Firestore, `ignoreUndefinedProperties`), `storage`. |
| `authInit.ts` / `authInit.native.ts` | Auth init. Web uses `browserLocalPersistence`; iOS/Android use `getReactNativePersistence(AsyncStorage)`. Metro picks the `.native.ts` file. |
| `firebase-auth-rn.d.ts` | Type shim: Firebase's `package.json` puts the public `types` entry before the `react-native` condition, so tsc can't see `getReactNativePersistence` even though Metro bundles the RN build that exports it. |
| `paths.ts` | Firestore/Storage paths + snapshot → type converters. |
| `auth.ts` | Family email/password auth + `users/{uid}` profile. |
| `chair.ts` | Chair device registration, pairing, heartbeat, linking, chair settings. |
| `messages.ts` | Send voice/text/photo, history, unplayed queue, latest photo. |
| `api.ts` | The public API the UI imports (re-exports the above). |

Extra exports beyond the original contract (all additive): `stopPairing(chairId)`,
`subscribeChair(chairId, cb)`, `deleteMessage(chairId, msg)`, `startOfLocalDay()`,
`PAIR_CODE_TTL_MS`, `MAX_TEXT_LENGTH`.

## Data model

Types live in `src/types.ts`. All timestamps are client `Date.now()` millis.

```
users/{uid}                        UserProfile { uid, displayName, chairIds[], createdAt }
chairs/{chairId}                   Chair { name, deviceUid, memberUids[], pairCode, pairCodeExpiresAt,
                                           volume, lastSeenAt, createdAt }  (+ joinCode, see pairing)
chairs/{chairId}/messages/{msgId}  ChairMessage { chairId, type, senderUid, senderName, text?, mediaPath?,
                                                  mediaUrl?, durationMs?, createdAt, playedAt }
pairCodes/{code}                   PairCode { code, chairId, expiresAt }

Storage:
chairs/{chairId}/voice/{msgId}.m4a     (audio/*, <= 10 MB)
chairs/{chairId}/photos/{msgId}.jpg    (image/*, <= 15 MB)
```

- `chairId` **is the chair device's anonymous auth uid** (one chair per device).
- Messages are always created with `playedAt: null`; the chair sets it to millis once played.
- The message id is generated first, so the media path contains it; media is uploaded
  before the message doc is written (the doc carries `mediaPath` and `mediaUrl`).

### Auth model
- **Family members**: Email/Password accounts. `onAuthChanged` emits their live profile.
- **Chair device**: Anonymous auth. `onAuthChanged` emits `null` for the anonymous user
  (it is not a family account) — chair mode should use `getMyChairDevice()`.
- One device has one Firebase session at a time. `registerChairDevice()` signs a family
  account out if one is signed in (the chair tablet is a dedicated device). Calling
  `signOut()` on the chair device loses its anonymous uid, i.e. it becomes a new chair.

## Pairing (no Cloud Functions)

1. Chair device: `registerChairDevice(name)` → anonymous sign-in, creates `chairs/{uid}`
   with `deviceUid = uid`, `memberUids = []`.
2. Chair device: `startPairing(chairId)` → random 6-digit code, written in one batch to
   `chairs/{id}.pairCode / pairCodeExpiresAt` and `pairCodes/{code} {chairId, expiresAt}`
   (10 minutes). The previous code doc of this chair is deleted. Codes still live for
   another chair are skipped.
3. Family user: `linkChairWithCode(code)` → `get pairCodes/{code}` (exact get; listing is
   denied), checks expiry, then one update on the chair:
   `{ memberUids: arrayUnion(myUid), joinCode: code }`, then adds the chairId to
   `users/{uid}.chairIds`.
4. Rules allow that update only if the only changed keys are `memberUids`/`joinCode`,
   the new member set equals old set ∪ {caller}, `joinCode == resource.pairCode`, and
   `request.time.toMillis() < pairCodeExpiresAt`. Anonymous users can't join.
5. Optionally the chair calls `stopPairing(chairId)` once `subscribeChair` shows a new member.

Leaving: `unlinkChair` removes only the caller from `memberUids` (rules enforce it).

## Security rules summary
- `users/{uid}`: only the owner (family account) reads/writes; fields validated.
- `chairs/{id}`: readable by the device and members. Device may change
  `name/volume/pairCode/pairCodeExpiresAt/lastSeenAt`; members may change `name/volume`;
  nobody can change `deviceUid`; `memberUids` only via self-join (with code) or self-leave.
- `messages`: read by device + members; create by members only, with
  `senderUid == auth.uid`, `type in [voice,text,photo]`, `playedAt == null`, text ≤ 2000
  chars, media path must match the message id; only the device can update and only
  `playedAt`; members can delete their own messages.
- `pairCodes`: any signed-in user can `get` by exact code, no `list`; only the device
  that owns `chairId` can create/update/delete; expiry ≤ 15 min ahead.
- Storage: read by members + device of the chair; create by members only (voice
  `audio/*` ≤ 10 MB, photos `image/*` ≤ 15 MB, file name `{msgId}.m4a|.jpg`); delete by
  the message's sender. Uses cross-service `firestore.get()`.

Note: Firebase download URLs contain an access token — anyone holding a `mediaUrl`
can fetch that file. They are only stored in message docs, which only members/device can read.

Rules were tested against the local emulators (50 allow/deny cases: pairing, joins with
wrong/expired codes, spoofed senders, playedAt, storage cross-service checks) — all pass.

## Indexes (`firebase/firestore.indexes.json`)
- `messages`: `playedAt ASC, createdAt ASC` — `subscribeUnplayed`
- `messages`: `type ASC, createdAt DESC` — `subscribeLatestPhoto`, `hasSentPhotoToday`

## One-time Firebase console setup
1. https://console.firebase.google.com → project **the-chair-that-holds-a-story**.
2. **Build → Authentication → Get started → Sign-in method**:
   - enable **Email/Password** (first toggle only; "Email link" not needed)
   - enable **Anonymous**
3. **Build → Firestore Database → Create database** (production mode, pick a region) if
   not created yet.
4. **Build → Storage → Get started** if not created yet (needs the Blaze plan on new
   projects with the `*.firebasestorage.app` bucket).

## Deploy rules and indexes
From the repo root (`firebase.json` and `.firebaserc` are there):

```sh
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules,firestore:indexes,storage
```

On the first storage deploy the CLI asks to grant Cloud Storage permission to read
Firestore (needed for cross-service rules) — answer **yes**. Composite indexes take a few
minutes to build; until then the chair's queries fail with a "requires an index" error.

### Run the rules locally (optional)
```sh
npx firebase-tools emulators:start --only firestore,storage --project demo-the-chair
```
