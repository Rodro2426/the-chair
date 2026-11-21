import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { brand, colors, radius, space } from '@/theme/tokens';
import { Icon, PressableScale, Txt, useToast } from '@/components/ui';
import type { MessagePlayer } from '@/hooks/useMessagePlayer';
import { fmtDate, type Story } from '@/lib/family';
import { mmss } from './format';

/** One of grandpa's stories: play, transcript, and a heart + comment so he knows someone listened. */
export function StoryCard({ story, player, hearted, onHeart, compact }: {
  story: Story; player: MessagePlayer; hearted: boolean; onHeart: () => void; compact?: boolean;
}) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const active = !!story.msg && player.activeId === story.msg.id;
  const playing = active && player.playing;
  const progress = active && player.duration > 0 ? player.currentTime / player.duration : 0;

  const play = () => {
    if (story.msg) player.toggle(story.msg);
    else toast.show('This is an example story. Grandpa\'s real stories will play here.');
  };

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <PressableScale onPress={play} hapticStyle="select" style={styles.play}
          accessibilityRole="button" accessibilityLabel={playing ? 'Pause story' : `Play story: ${story.title}`}>
          <Icon name={playing ? 'pause' : 'play'} size={24} color={brand.black} />
        </PressableScale>
        <View style={{ flex: 1, gap: 4 }}>
          <Txt variant="heading" numberOfLines={2}>{story.title}</Txt>
          <Txt variant="label" tone="faint" style={styles.meta}>
            {fmtDate(story.createdAt)} · {story.topic.toUpperCase()}{story.durationMs ? ` · ${mmss(story.durationMs)}` : ''}{story.example ? ' · EXAMPLE' : ''}
          </Txt>
        </View>
      </View>

      <View style={styles.track}><View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} /></View>

      {story.transcript ? (
        <PressableScale onPress={() => setOpen(!open)} hapticStyle="none" accessibilityRole="button" accessibilityLabel="Show full transcript">
          <Txt variant="body" tone="muted" numberOfLines={open ? undefined : compact ? 2 : 3}>“{story.transcript}”</Txt>
        </PressableScale>
      ) : (
        <View style={styles.noTranscript}>
          <Txt variant="label" tone="faint" style={styles.meta}>No transcript yet</Txt>
          <PressableScale onPress={() => {}} hapticStyle="select" style={styles.ghost} accessibilityRole="button" accessibilityLabel="Transcribe">
            <Txt variant="label" style={styles.meta}>Transcribe</Txt>
          </PressableScale>
        </View>
      )}

      {!compact && (
        <View style={styles.actions}>
          <PressableScale onPress={onHeart} hapticStyle="select" style={styles.action}
            accessibilityRole="button" accessibilityLabel={hearted ? 'Remove heart' : 'Send a heart'}>
            <Icon name={hearted ? 'heartFilled' : 'heart'} size={22} color={hearted ? colors.primary : colors.text} />
            <Txt variant="label" style={styles.meta}>{hearted ? 'Loved' : 'Heart'}</Txt>
          </PressableScale>
          <PressableScale onPress={() => {}} hapticStyle="select" style={styles.action} accessibilityRole="button" accessibilityLabel="Comment">
            <Icon name="comment" size={22} color={colors.text} />
            <Txt variant="label" style={styles.meta}>Comment</Txt>
          </PressableScale>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: space.md, padding: space.lg, borderRadius: radius.sm, borderWidth: 1, borderColor: brand.divider, backgroundColor: colors.bgElevated },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  play: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center' },
  meta: { fontSize: 12, letterSpacing: 1.4 },
  track: { height: 2, backgroundColor: brand.divider },
  fill: { height: 2, backgroundColor: colors.primary },
  noTranscript: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ghost: { paddingHorizontal: space.md, paddingVertical: space.sm, borderWidth: 1, borderColor: brand.divider, borderRadius: radius.sm },
  actions: { flexDirection: 'row', gap: space.lg, borderTopWidth: StyleSheet.hairlineWidth, borderColor: brand.divider, paddingTop: space.md },
  action: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 44, paddingRight: space.md },
});
