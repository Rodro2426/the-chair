import type { Chair } from '@/types';

export const ONLINE_WINDOW_MS = 2 * 60 * 1000;

export function isChairOnline(chair: Pick<Chair, 'lastSeenAt'> | null | undefined, now = Date.now()) {
  return !!chair?.lastSeenAt && now - chair.lastSeenAt < ONLINE_WINDOW_MS;
}

export function formatDuration(ms: number) {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function relativeTime(ts: number, now = Date.now()) {
  const diff = Math.max(0, now - ts);
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'yesterday';
  if (d < 7) return `${d} days ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function lastSeenLabel(chair: Pick<Chair, 'lastSeenAt'>, now = Date.now()) {
  if (isChairOnline(chair, now)) return 'In the chair';
  if (!chair.lastSeenAt) return 'Not connected yet';
  return `Seen ${relativeTime(chair.lastSeenAt, now)}`;
}

export function dayLabel(ts: number, now = Date.now()) {
  const d = new Date(ts);
  const today = new Date(now);
  const y = new Date(now - 86400000);
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (same(d, today)) return 'Today';
  if (same(d, y)) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

export function clockTime(ts: number) {
  return new Date(ts).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

/** "00:07" style mono timer. */
export function mmss(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

const RELATION = /^(grand(ma|pa|mother|father)|granny|gran|nana|nan|nanna|nonna|nonno|abuel[ao]|abu|yaya|oma|opa|mamie|papi|papy|mimi|pop|pops|bubbe|zayde|aunt|auntie|uncle|tia|tio)$/i;

/** "Grandma Rosa" → "Rosa"; "Rosa" → "Rosa"; "Nonna" → "Nonna". */
export function shortName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length > 1 && RELATION.test(parts[0])) return parts.slice(1).join(' ');
  return parts[0] ?? name;
}

/** Local calendar-day key. */
export function dayKey(ts: number | Date) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}
