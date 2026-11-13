import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, colorsUi, gradientsUi, radius, space } from '@/theme/tokens';
import type { ChairMessage } from '@/types';
import { Icon, PressableScale, Txt, accentPalette } from '@/components/ui';
import type { MessagePlayer } from '@/hooks/useMessagePlayer';
import { clockTime, formatDuration } from './format';
import { StaticWaveform } from './Waveform';

function Meta({ msg, mine, light }: { msg: ChairMessage; mine: boolean; light?: boolean }) {
  const c = light ? colorsUi.onAccent : colors.textMuted;
  return (
    <View style={styles.meta}>
      <Txt variant="caption" color={c} style={{ opacity: 0.85 }}>
        {mine ? '' : `${msg.senderName} · `}{clockTime(msg.createdAt)}
      </Txt>
      {msg.playedAt ? (
        <Txt variant="caption" color={light ? colorsUi.onAccent : colors.success}>
          {msg.type === 'photo' ? 'Seen ✓' : 'Played ✓'}
        </Txt>
      ) : (
        <Txt variant="caption" color={c} style={{ opacity: 0.6 }}>Delivered</Txt>
      )}
    </View>
  );
}

function VoiceBubble({ msg, mine, player }: { msg: ChairMessage; mine: boolean; player: MessagePlayer }) {
  const active = player.activeId === msg.id;
  const playing = active && player.playing;
  const totalMs = active && player.duration > 0 ? player.duration * 1000 : msg.durationMs ?? 0;
  const progress = active && player.duration > 0 ? player.currentTime / player.duration : 0;
  const p = accentPalette.voice;
  return (
    <View style={[styles.bubble, styles.voice, mine ? styles.mine : styles.theirs]}>
      <LinearGradient colors={p.face} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={gradientsUi.gloss} style={styles.gloss} />
      <View style={styles.voiceRow}>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={playing ? 'Pause' : 'Play voice message'}
          disabled={!msg.mediaUrl}
          onPress={() => player.toggle(msg)}
          style={styles.play}
          hitSlop={6}
        >
          <Icon name={playing ? 'pause' : 'play'} size={playing ? 14 : 18} color={colors.primary} style={!playing && { marginLeft: 3 }} />
        </PressableScale>
        <View style={{ flex: 1, gap: 4 }}>
          <StaticWaveform seed={msg.id} progress={progress} color={p.label} dim={colorsUi.highlightEdge} />
          <Txt variant="caption" color={p.label}>
            {active && player.currentTime > 0 ? `${formatDuration(player.currentTime * 1000)} / ` : ''}
            {formatDuration(totalMs)}
          </Txt>
        </View>
      </View>
      <Meta msg={msg} mine={mine} light />
    </View>
  );
}

/** Renders one message of the conversation (voice / photo / text). */
export function MessageBubble({ msg, mine, player }: { msg: ChairMessage; mine: boolean; player: MessagePlayer }) {
  if (msg.type === 'voice') return <VoiceBubble msg={msg} mine={mine} player={player} />;
  if (msg.type === 'photo') {
    return (
      <View style={[styles.bubble, styles.photo, mine ? styles.mine : styles.theirs]}>
        {msg.mediaUrl ? (
          <Image source={{ uri: msg.mediaUrl }} style={styles.photoImg} contentFit="cover" transition={250} />
        ) : (
          <View style={[styles.photoImg, styles.photoPlaceholder]}><Icon name="photo" size={40} /></View>
        )}
        <View style={{ padding: space.md, gap: 4 }}>
          <Txt variant="caption" tone="secondary" upper>Photo of the day</Txt>
          {!!msg.text && <Txt variant="body">{msg.text}</Txt>}
          <Meta msg={msg} mine={mine} />
        </View>
      </View>
    );
  }
  return (
    <View style={[styles.bubble, styles.text, mine ? styles.mine : styles.theirs]}>
      <LinearGradient colors={gradientsUi.glossSoft} style={styles.gloss} />
      <Txt variant="heading" style={{ fontWeight: '600', lineHeight: 26 }}>{msg.text}</Txt>
      <Meta msg={msg} mine={mine} />
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: { maxWidth: '86%', borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.cardBorder },
  mine: { alignSelf: 'flex-end', borderBottomRightRadius: radius.sm / 2 },
  theirs: { alignSelf: 'flex-start', borderBottomLeftRadius: radius.sm / 2 },
  gloss: { position: 'absolute', left: 0, right: 0, top: 0, height: '50%' },
  voice: { width: 290, padding: space.md, gap: space.sm },
  voiceRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  play: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center' },
  photo: { width: 260, backgroundColor: colors.card },
  photoImg: { width: '100%', aspectRatio: 1 },
  photoPlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bgElevated },
  text: { padding: space.md + 2, gap: space.sm, backgroundColor: colors.tertiaryDeep },
  meta: { flexDirection: 'row', justifyContent: 'space-between', gap: space.md },
});
