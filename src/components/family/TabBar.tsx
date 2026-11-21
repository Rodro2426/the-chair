import { StyleSheet, View } from 'react-native';
import { router, usePathname, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { brand, colors, space } from '@/theme/tokens';
import { Icon, PressableScale, Txt, type IconName } from '@/components/ui';

const TABS: { href: string; label: string; icon: IconName }[] = [
  { href: '/home', label: 'Home', icon: 'home' },
  { href: '/stories', label: 'Stories', icon: 'book' },
  { href: '/talk', label: 'Talk', icon: 'mic' },
  { href: '/ask', label: 'Ask', icon: 'question' },
  { href: '/family', label: 'Family', icon: 'family' },
];

/** Bottom navigation for the family app. Big targets, icon + word, yellow underline on the active tab. */
export function TabBar() {
  const insets = useSafeAreaInsets();
  const path = usePathname();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, space.sm) }]}>
      {TABS.map((t) => {
        const active = path === t.href || path.startsWith(t.href + '/');
        return (
          <PressableScale
            key={t.href}
            hapticStyle="select"
            onPress={() => { if (!active) router.replace(t.href as Href); }}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={t.label}
            style={styles.tab}
          >
            <Icon name={t.icon} size={24} color={active ? colors.text : colors.textFaint} />
            <Txt variant="label" style={[styles.label, { color: active ? colors.text : colors.textFaint }]}>{t.label}</Txt>
            <View style={[styles.underline, active && { backgroundColor: colors.primary }]} />
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, borderColor: brand.divider,
    backgroundColor: colors.bg, paddingTop: space.sm, width: '100%',
  },
  tab: { flex: 1, alignItems: 'center', gap: 4, minHeight: 56, justifyContent: 'center' },
  label: { fontSize: 11, letterSpacing: 1.4 },
  underline: { width: 18, height: 2, backgroundColor: 'transparent', marginTop: 2 },
});
