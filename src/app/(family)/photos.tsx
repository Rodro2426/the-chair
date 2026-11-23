import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { brand, colors, radius, space } from '@/theme/tokens';
import { Icon, PressableScale, ScreenBackground, ScreenHeader, Txt } from '@/components/ui';
import { useChairs } from '@/hooks/useChairs';
import { startOfLocalDay, subscribePhotos, useMediaUrl } from '@/lib/api';
import type { ChairMessage } from '@/types';

const dayLabel = (ms: number) => new Date(ms).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase();
const monthLabel = (ms: number) => new Date(ms).toLocaleDateString([], { month: 'long', year: 'numeric' }).toUpperCase();

/** Photo archive: every photo of the day. The chair only shows today's; the rest live here. */
export default function Photos() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { selected } = useChairs();
  const [photos, setPhotos] = useState<ChairMessage[] | null>(null);
  const [open, setOpen] = useState<ChairMessage | null>(null);

  useEffect(() => {
    if (!selected) { setPhotos([]); return; }
    return subscribePhotos(selected.id, setPhotos);
  }, [selected?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const today = startOfLocalDay();
  const groups = useMemo(() => {
    const out: { title: string; items: ChairMessage[] }[] = [];
    for (const p of photos ?? []) {
      const title = p.createdAt >= today ? 'TODAY' : monthLabel(p.createdAt);
      const g = out[out.length - 1];
      if (g && g.title === title) g.items.push(p); else out.push({ title, items: [p] });
    }
    return out;
  }, [photos, today]);

  const contentW = Math.min(width, 640) - space.lg * 2;
  const tile = Math.floor((contentW - space.sm) / 2);

  return (
    <ScreenBackground>
      <View style={{ paddingTop: insets.top }}>
        <ScreenHeader title="Photo archive" subtitle={selected ? `${selected.name}’s chair` : undefined} />
      </View>
      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + space.xxl }]}>
        <Txt variant="body" tone="muted">
          Each photo of the day shows on the chair until midnight. After that it’s kept here.
        </Txt>
        {photos && photos.length === 0 ? (
          <View style={styles.empty}>
            <Icon name="photo" size={36} color={colors.textFaint} />
            <Txt variant="body" tone="faint" align="center">No photos yet. Send a photo of the day and it will be saved here.</Txt>
          </View>
        ) : null}
        {groups.map((g) => (
          <View key={g.title} style={{ gap: space.md }}>
            <Txt variant="label" tone={g.title === 'TODAY' ? 'default' : 'faint'} style={styles.small}>{g.title}</Txt>
            <View style={styles.grid}>
              {g.items.map((p) => (
                <Tile key={p.id} msg={p} size={tile} onPress={() => setOpen(p)} onChair={p.id === photos?.[0]?.id && p.createdAt >= today} />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={!!open} transparent animationType="fade" onRequestClose={() => setOpen(null)}>
        {open ? <Viewer msg={open} onClose={() => setOpen(null)} /> : null}
      </Modal>
    </ScreenBackground>
  );
}

function Tile({ msg, size, onPress, onChair }: { msg: ChairMessage; size: number; onPress: () => void; onChair?: boolean }) {
  const uri = useMediaUrl(msg);
  return (
    <PressableScale onPress={onPress} hapticStyle="select" accessibilityRole="button"
      accessibilityLabel={`Photo from ${msg.senderName}, ${dayLabel(msg.createdAt)}`} style={{ width: size, gap: 6 }}>
      <View style={[styles.img, { width: size, height: size }]}>
        {uri ? <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} /> : null}
        {onChair ? <View style={styles.badge}><Txt variant="label" style={[styles.small, { color: '#FAF5EC' }]}>On the chair now</Txt></View> : null}
      </View>
      <Txt variant="label" tone="faint" style={styles.small} numberOfLines={1}>{dayLabel(msg.createdAt)} · {msg.senderName.toUpperCase()}</Txt>
    </PressableScale>
  );
}

function Viewer({ msg, onClose }: { msg: ChairMessage; onClose: () => void }) {
  const uri = useMediaUrl(msg);
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.viewer}>
      <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close"
        style={[styles.close, { top: insets.top + space.md }]} hitSlop={12}>
        <Icon name="close" size={26} color="#FAF5EC" />
      </Pressable>
      <View style={styles.full}>
        {uri ? <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="contain" /> : null}
      </View>
      <View style={[styles.caption, { paddingBottom: insets.bottom + space.lg }]}>
        {msg.text ? <Txt variant="title" style={{ color: '#FAF5EC', fontSize: 30, lineHeight: 36 }}>{msg.text}</Txt> : null}
        <Txt variant="label" style={[styles.small, { color: 'rgba(250,245,236,0.7)' }]}>
          {dayLabel(msg.createdAt)} · FROM {msg.senderName.toUpperCase()}
        </Txt>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: space.lg, gap: space.xl, width: '100%', maxWidth: 640, alignSelf: 'center' },
  small: { fontSize: 12, letterSpacing: 1.4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, rowGap: space.lg },
  img: { borderRadius: radius.sm, overflow: 'hidden', backgroundColor: brand.greyDark },
  badge: { position: 'absolute', left: 8, bottom: 8, backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm },
  empty: { alignItems: 'center', gap: space.md, paddingVertical: space.xxl },
  viewer: { flex: 1, backgroundColor: 'rgba(20,14,10,0.96)' },
  close: { position: 'absolute', right: space.lg, zIndex: 2, padding: space.sm },
  full: { flex: 1, margin: space.lg, marginTop: 72 },
  caption: { paddingHorizontal: space.lg, gap: space.sm },
});
