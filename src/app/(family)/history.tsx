import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, colorsUi, radius, space } from '@/theme/tokens';
import { GlossyButton, IconBadge, IconButton, ScreenBackground, ScreenHeader, Txt } from '@/components/ui';
import { MessageBubble, OnlinePill, dayLabel } from '@/components/family';
import { useAuth } from '@/hooks/useAuth';
import { useChairs } from '@/hooks/useChairs';
import { useMessages } from '@/hooks/useMessages';
import { useMessagePlayer } from '@/hooks/useMessagePlayer';

export default function History() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { selected } = useChairs();
  const { messages, loading } = useMessages(selected?.id, 100);
  const player = useMessagePlayer();

  return (
    <ScreenBackground glow="photo">
      <View style={{ paddingTop: insets.top }}>
        <ScreenHeader right={selected && <OnlinePill chair={selected} />} />
        <View style={styles.titleWrap}>
          <Txt variant="caption" tone="muted" upper>Conversation with</Txt>
          <Txt variant="title" numberOfLines={1}>{selected?.name ?? 'your chair'}</Txt>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={colors.primary} size="large" /></View>
      ) : messages.length === 0 ? (
        <View style={styles.center}>
          <IconBadge name="wave" accent="text" size={88} />
          <Txt variant="title" align="center">Say hello!</Txt>
          <Txt variant="body" tone="muted" align="center">Everything you send will show up here,{'\n'}with a ✓ once it’s been played.</Txt>
        </View>
      ) : (
        <FlatList
          inverted
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => {
            const older = messages[index + 1];
            const showDay = !older || new Date(older.createdAt).toDateString() !== new Date(item.createdAt).toDateString();
            return (
              <View style={{ gap: space.sm }}>
                {showDay && (
                  <View style={styles.day}><Txt variant="caption" tone="muted">{dayLabel(item.createdAt)}</Txt></View>
                )}
                <MessageBubble msg={item} mine={item.senderUid === user?.uid} player={player} />
              </View>
            );
          }}
          ItemSeparatorComponent={() => <View style={{ height: space.md }} />}
        />
      )}

      <View style={[styles.bar, { paddingBottom: insets.bottom + space.md }]}>
        <IconButton name="photo" label="Send a photo" accent="photo" size={56} onPress={() => router.push('/photo')} />
        <GlossyButton title="Write a note" icon="text" accent="text" size="md" style={{ flex: 1 }} onPress={() => router.push('/text')} />
        <IconButton name="mic" label="Record a voice message" accent="voice" size={56} onPress={() => router.navigate('/home')} />
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  titleWrap: { paddingHorizontal: space.lg, paddingBottom: space.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md, padding: space.lg },
  list: { paddingHorizontal: space.lg, paddingVertical: space.lg, width: '100%', maxWidth: 640, alignSelf: 'center' },
  day: {
    alignSelf: 'center', paddingHorizontal: space.md, paddingVertical: 4, borderRadius: radius.pill,
    backgroundColor: colorsUi.inputBg, marginVertical: space.sm,
  },
  bar: {
    flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingTop: space.md,
    borderTopWidth: 1, borderColor: colors.cardBorder, backgroundColor: colors.bgElevated,
  },
});
