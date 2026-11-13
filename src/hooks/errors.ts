/** Turns backend / Firebase errors into short, friendly copy. */
export function friendlyError(e: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const code = typeof e === 'object' && e && 'code' in e ? String((e as { code: unknown }).code) : '';
  const msg = e instanceof Error ? e.message : typeof e === 'string' ? e : '';
  const map: Record<string, string> = {
    'auth/invalid-email': 'That email doesn’t look right.',
    'auth/user-not-found': 'No account with that email yet.',
    'auth/wrong-password': 'That password isn’t right.',
    'auth/invalid-credential': 'Email or password isn’t right.',
    'auth/email-already-in-use': 'That email already has an account — try signing in.',
    'auth/weak-password': 'Pick a password with at least 6 characters.',
    'auth/network-request-failed': 'No connection. Check your internet and try again.',
    'auth/too-many-requests': 'Too many tries. Take a breath and try again in a minute.',
    'permission-denied': 'You don’t have access to that chair anymore.',
    unavailable: 'No connection. Check your internet and try again.',
  };
  if (code && map[code]) return map[code];
  if (/not implemented/i.test(msg)) return 'This isn’t ready yet — the backend is still being wired up.';
  if (msg && msg.length < 120 && !/firebase|\bat\b.*\(/i.test(msg)) return msg;
  return fallback;
}
