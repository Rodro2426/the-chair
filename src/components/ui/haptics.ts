import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const enabled = Platform.OS === 'ios' || Platform.OS === 'android';

/** Thin, fail-safe haptics wrapper (no-ops on web / unsupported devices). */
export const haptic = {
  tap: () => { if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); },
  press: () => { if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}); },
  heavy: () => { if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {}); },
  select: () => { if (enabled) Haptics.selectionAsync().catch(() => {}); },
  success: () => { if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); },
  warning: () => { if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {}); },
  error: () => { if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {}); },
};
