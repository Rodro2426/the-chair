import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { brand, colors, radius, space } from '@/theme/tokens';
import type { ChairMessage } from '@/types';
import { Icon, PressableScale, Txt } from '@/components/ui';
import type { MessagePlayer } from '@/hooks/useMessagePlayer';
import { clockTime, mmss } from './format';
import { StaticWaveform } from './Waveform';

function Meta({ msg, mine }: { msg: ChairMessage; mine: boolean }) {
  return (
    <View style={styles.meta}>
      <Txt variant="caption" tone="faint" style={styles.metaText}>
        {mine ? '' : `${msg.senderName.toUpperCase()} · `}{clockTime(msg.createdAt)}
      </Txt>
      {msg.playedAt ? (
        <View style={styles.heard}>
          <Icon name="check" size={13} strokeWidth={2.6} color={colors.text} />
          <Txt variant="caption" style={styles.metaText}>{msg.type === 'photo' ? 'SEEN' : 'HEARD'}</Txt>
        </View>
      ) : (
        <Txt variant="caption" tone="faint" style={styles.metaText}>DELIVERED</Txt>
      )}
    </View>
  );
}

function VoiceBubble({ msg, mine, player }: { msg: ChairMessage; mine: boolean; player: MessagePlayer }) {
  const active = player.activeId === msg.id;
  const playing = active && player.playing;
  const totalMs = active && player.duration > 0 ? player.duration * 1000 : msg.durationMs ?? 0;
  const progress = active && player.duration > 0 ? player.currentTime / player.duration : 0;
  return (
    <View style={[styles.bubble, styles.voice, mine ? styles.mine : styles.theirs]}>
      <View style={styles.voiceRow}>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={playing ? 'Pause' : 'Play voice message'}
          disabled={!msg.mediaUrl}
          onPress={() => player.toggle(msg)}
          style={styles.play}
          hitSlop={6}
        >
          <Icon name={playing ? 'pause' : 'play'} size={20} color={brand.black} style={!playing && { marginLeft: 3 }} />
        </PressableScale>
        <View style={{ flex: 1, gap: 6 }}>
          <StaticWaveform seed={msg.id} progress={progress} color={colors.text} dim="rgba(255,255,255,0.22)" />
          <Txt variant="number" tone="muted" style={{ fontSize: 14 }}>
            {active && player.currentTime > 0 ? `${mmss(player.currentTime * 1000)} / ` : ''}
            {mmss(totalMs)}
          </Txt>
        </View>
      </View>
      <Meta msg={msg} mine={mine} />
    </View>
  );
}

/** One message of the conversation (voice / photo / text) — monochrome, square-cornered. */
export function MessageBubble({ msg, mine, player }: { msg: ChairMessage; mine: boolean; player: MessagePlayer }) {
  if (msg.type === 'voice') return <VoiceBubble msg={msg} mine={mine} player={player} />;
  if (msg.type === 'photo') {
    return (
      <View style={[styles.bubble, styles.photo, mine ? styles.mine : styles.theirs]}>
        {msg.mediaUrl ? (
          <Image source={{ uri: msg.mediaUrl }} style={styles.photoImg} contentFit="cover" transition={250} />
        ) : (
          <View style={[styles.photoImg, styles.photoPlaceholder]}><Icon name="photo" size={36} color={colors.textFaint} /></View>
        )}
        <View style={{ padding: space.md, gap: 6 }}>
          <Txt variant="caption" tone="faint" upper>Photo of the day</Txt>
          {!!msg.text && <Txt variant="body">{msg.text}</Txt>}
          <Meta msg={msg} mine={mine} />
        </View>
      </View>
    );
  }
  return (
    <View style={[styles.bubble, styles.text, mine ? styles.mine : styles.theirs]}>
      <Txt variant="body" style={{ fontSize: 18, lineHeight: 27 }}>{msg.text}</Txt>
      <Meta msg={msg} mine={mine} />
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: { maxWidth: '88%', borderRadius: radius.sm, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  mine: { alignSelf: 'flex-end', backgroundColor: '#262626' },
  theirs: { alignSelf: 'flex-start', backgroundColor: brand.black },
  voice: { width: 300, padding: space.md, gap: space.md },
  voiceRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  play: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center' },
  photo: { width: 270 },
  photoImg: { width: '100%', aspectRatio: 1 },
  photoPlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: brand.black },
  text: { padding: space.md + 2, gap: space.md },
  meta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space.md },
  metaText: { fontSize: 12, letterSpacing: 1.2 },
  heard: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
