import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { brand, colors, radius, space } from '@/theme/tokens';
import { Icon, PressableScale, Txt, haptic } from '@/components/ui';
import { useMessagePlayer } from '@/hooks/useMessagePlayer';
import { markReplyHeard } from '@/lib/api';
import type { ChairMessage } from '@/types';
import { mmss, shortName } from './format';

/**
 * Shows the oldest voice reply from the chair that nobody has heard yet.
 * Tap to play it out loud; it's marked heard as soon as it starts.
 */
export function ReplyBanner({ chairId, replies }: { chairId: string; replies: ChairMessage[] }) {
  const player = useMessagePlayer();
  const msg = replies[0];
  const marked = useRef(new Set<string>());
  const isActive = !!msg && player.activeId === msg.id;

  useEffect(() => {
    if (isActive && player.playing && msg && !marked.current.has(msg.id)) {
      marked.current.add(msg.id);
      markReplyHeard(chairId, msg.id).catch((e) => console.warn('[reply] markReplyHeard failed', e));
    }
  }, [isActive, player.playing, msg, chairId]);

  if (!msg) return null;
  const who = shortName(msg.senderName || 'Your chair');
  const more = replies.length - 1;
  const playing = isActive && player.playing;

  return (
    <PressableScale
      onPress={() => { haptic.select(); player.toggle(msg); }}
      accessibilityRole="button"
      accessibilityLabel={`Play voice message from ${who}`}
      style={styles.banner}
    >
      <View style={styles.play}>
        <Icon name={playing ? 'pause' : 'play'} size={22} color={brand.black} />
      </View>
      <View style={{ flex: 1 }}>
        <Txt variant="label" style={styles.title}>{playing ? `Playing ${who}` : `New from ${who}`}</Txt>
        <Txt variant="label" tone="faint" style={styles.sub}>
          {msg.durationMs ? mmss(msg.durationMs) : 'Voice'}{more > 0 ? ` · ${more} more` : ''}
        </Txt>
      </View>
      <View style={styles.dot} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: space.md,
    marginHorizontal: space.lg, marginBottom: space.lg, padding: space.md,
    borderRadius: radius.sm, borderWidth: 1, borderColor: brand.divider, backgroundColor: colors.bgElevated,
  },
  play: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 15 },
  sub: { fontSize: 13, marginTop: 2 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
});
