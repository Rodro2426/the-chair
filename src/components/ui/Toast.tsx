import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadow, space } from '@/theme/tokens';
import { haptic } from './haptics';
import { Txt } from './Txt';

type Kind = 'info' | 'success' | 'error';
interface ToastItem { id: number; message: string; kind: Kind }
interface ToastApi { show: (message: string, kind?: Kind) => void }

const ToastCtx = createContext<ToastApi>({ show: () => {} });

export function useToast() { return useContext(ToastCtx); }

/** Friendly floating toasts at the top of the screen. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const next = useRef(1);
  const insets = useSafeAreaInsets();

  const show = useCallback((message: string, kind: Kind = 'info') => {
    const id = next.current++;
    if (kind === 'error') haptic.error(); else if (kind === 'success') haptic.success();
    setItems((cur) => [...cur.slice(-2), { id, message, kind }]);
    setTimeout(() => setItems((cur) => cur.filter((t) => t.id !== id)), 3200);
  }, []);
  const api = useMemo(() => ({ show }), [show]);

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <View pointerEvents="none" style={[styles.host, { top: insets.top + space.sm }]}>
        {items.map((t) => (
          <Animated.View key={t.id} entering={FadeInUp.springify().damping(16)} exiting={FadeOutUp} style={[styles.toast, shadow.card]}>
            <View style={[styles.dot, { backgroundColor: t.kind === 'error' ? colors.danger : t.kind === 'success' ? colors.success : colors.primary }]} />
            <Txt variant="body" style={{ flex: 1 }}>{t.message}</Txt>
          </Animated.View>
        ))}
      </View>
    </ToastCtx.Provider>
  );
}

const styles = StyleSheet.create({
  host: { position: 'absolute', left: space.md, right: space.md, gap: space.sm, alignItems: 'center' },
  toast: {
    flexDirection: 'row', alignItems: 'center', gap: space.md, maxWidth: 520, width: '100%',
    backgroundColor: colors.bgElevated, borderColor: colors.cardBorder, borderWidth: 1,
    borderRadius: radius.md, paddingVertical: space.md, paddingHorizontal: space.lg,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
