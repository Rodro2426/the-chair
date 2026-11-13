# Chair receiver protocol

How any receiver (today: the app's `/chair` mode on a tablet; later: a Raspberry Pi,
ESP32 or custom board) behaves. Data layout is defined in `src/types.ts`.

## Data it touches

| Path | Access | Purpose |
|---|---|---|
| `chairs/{chairId}` | read/write own doc | `name`, `volume` (0..1), `memberUids`, `pairCode`, `pairCodeExpiresAt`, `lastSeenAt` |
| `chairs/{chairId}/messages/{msgId}` | read, write `playedAt` | `type` (`voice`/`text`/`photo`), `senderName`, `text`, `mediaUrl`, `durationMs`, `createdAt`, `playedAt` |
| `pairCodes/{code}` | create/delete | `{ code, chairId, expiresAt }` |
| Storage `chairs/{chairId}/voice/{msgId}.m4a`, `.../photos/{msgId}.jpg` | read | media (AAC/m4a, JPEG) |

The chair is owned by an **anonymous Firebase Auth user** (`chairs/{id}.deviceUid == auth.uid`).
Security rules must let that uid update only `playedAt` on messages and
`lastSeenAt`/`pairCode*` on its chair.

## Lifecycle

1. **Sign in anonymously** (Identity Toolkit REST `accounts:signUp` with the web API key,
   no body → `idToken`, `refreshToken`, `localId`). Persist the refresh token on disk;
   refresh via `securetoken.googleapis.com/v1/token` every ~55 min. Losing it = a new
   device identity (that is what "Reset chair" does).
2. **Register** (first boot): create `chairs/{autoId}` with `deviceUid = uid`, `name`,
   `memberUids: []`, `volume: 0.8`, `pairCode: null`, `lastSeenAt: null`, `createdAt: now`.
   Store `chairId` locally. On later boots, query `chairs where deviceUid == uid`.
3. **Pair**: pick a random 6-digit code, write `pairCodes/{code}` with
   `expiresAt = now + 10 min`, and mirror it into `chairs/{chairId}.pairCode/pairCodeExpiresAt`.
   Show it (screen, e-ink, or speak it: "Your code is 4 8 1 … "). When expired, delete
   and repeat. Family phones call `linkChairWithCode`, which appends to `memberUids`.
4. **Heartbeat**: every 60 s set `chairs/{chairId}.lastSeenAt = now` (ms). Family apps
   treat > 3 min as offline.
5. **Listen**: query `chairs/{chairId}/messages where playedAt == null order by createdAt asc`
   (create the composite index). Also listen to the chair doc for `volume`/`name` changes.
6. **Play**, strictly one at a time, oldest first, tracking in-flight ids so a snapshot
   re-delivery never starts the same message twice:
   - optional soft chime;
   - TTS: "Message from {senderName}" (photos: "New photo from {senderName}");
   - `voice`: download `mediaUrl` (HTTPS GET, it is a tokenised download URL) to a temp
     file and play at `volume`;
   - `text`: TTS of `text` at a slow rate (~0.85×);
   - `photo`: show the image full-screen (if there's a display), read `text` as caption.
7. **Acknowledge**: write `playedAt = now` (ms). If playback fails, retry once, then write
   `playedAt` anyway so a broken file can't block the queue forever.
8. **Replay**: a single physical button (or tap) replays the last message locally; it does
   not write anything.

## Raspberry Pi (Python, `firebase-admin` or REST)

`firebase-admin` uses a service account (bypasses rules) — fine for a prototype on a
trusted device; for production use the REST/`google-cloud-firestore` client with the
anonymous user's `idToken` so rules apply.

```python
import time, tempfile, subprocess, requests, threading
from google.cloud import firestore  # or firebase_admin.firestore

db = firestore.Client()             # credentials: service account or user idToken
chair = db.collection("chairs").document(CHAIR_ID)
busy, inflight = threading.Lock(), set()

def say(t): subprocess.run(["espeak-ng", "-s", "140", t])        # or pico2wave/piper

def play(msg):
    say(("New photo from " if msg["type"] == "photo" else "Message from ") + msg["senderName"])
    if msg["type"] == "voice":
        f = tempfile.NamedTemporaryFile(suffix=".m4a", delete=False)
        f.write(requests.get(msg["mediaUrl"], timeout=30).content); f.close()
        vol = round(chair.get().get("volume") * 100)  # ffplay volume is 0..100
        subprocess.run(["ffplay", "-nodisp", "-autoexit", "-volume", str(vol), f.name], check=True)
    elif msg["type"] == "text":
        say(msg["text"])

def on_snapshot(docs, *_):
    for d in sorted(docs, key=lambda d: d.get("createdAt")):
        if d.id in inflight: continue
        inflight.add(d.id)
        with busy:
            for attempt in (1, 2):
                try: play(d.to_dict()); break
                except Exception: time.sleep(2)
            d.reference.update({"playedAt": int(time.time() * 1000)})

chair.collection("messages").where("playedAt", "==", None).order_by("createdAt").on_snapshot(on_snapshot)
while True:
    chair.update({"lastSeenAt": int(time.time() * 1000)}); time.sleep(60)
```

## ESP32 / microcontroller

No Firestore SDK with listeners; poll instead:

- Auth: Identity Toolkit REST (`accounts:signUp`, then token refresh) over HTTPS.
- Every 10–15 s: Firestore REST `:runQuery` on `chairs/{id}/messages` with
  `where playedAt == null`, `orderBy createdAt`, `limit 1`.
- Stream `mediaUrl` (m4a/AAC) through a decoder (e.g. ESP32-audioI2S) to an I2S DAC.
  TTS isn't feasible on-device: play a pre-recorded chime, or have a Cloud Function
  render "Message from X" + text messages to audio and store them under
  `chairs/{id}/voice/{msgId}.m4a` (`mediaUrl` on text messages).
- Ack with `PATCH .../messages/{msgId}?updateMask.fieldPaths=playedAt`.
- Heartbeat: `PATCH chairs/{id}?updateMask.fieldPaths=lastSeenAt` every 60 s.
- Pairing without a screen: speak the code, or show it on a small OLED.
