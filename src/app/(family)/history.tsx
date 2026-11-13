import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { brand, colors, space } from '@/theme/tokens';
import { Icon, PressableScale, ScreenBackground, ScreenHeader, Txt, type IconName } from '@/components/ui';
import { MessageBubble, dayLabel } from '@/components/family';
import { useAuth } from '@/hooks/useAuth';
import { useChairs } from '@/hooks/useChairs';
import { useMessages } from '@/hooks/useMessages';
import { useMessagePlayer } from '@/hooks/useMessagePlayer';

function Action({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <PressableScale onPress={onPress} pressedScale={0.94} hapticStyle="select" accessibilityRole="button" accessibilityLabel={label} style={styles.action}>
      <Icon name={icon} size={24} strokeWidth={2.2} />
      <Txt variant="label" tone="muted" style={{ fontSize: 12, letterSpacing: 1.6 }}>{label}</Txt>
    </PressableScale>
  );
}

export default function History() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { selected } = useChairs();
  const { messages, loading } = useMessages(selected?.id, 100);
  const player = useMessagePlayer();

  return (
    <ScreenBackground>
      <View style={{ paddingTop: insets.top }}>
        <ScreenHeader title={selected?.name ?? 'Conversation'} subtitle="Conversation" />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={colors.text} /></View>
      ) : messages.length === 0 ? (
        <View style={styles.center}>
          <Txt variant="display" align="center">Say hello.</Txt>
          <Txt variant="body" tone="muted" align="center">Everything you send shows up here,{'\n'}marked HEARD once it has played.</Txt>
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
                  <View style={styles.day}>
                    <View style={styles.rule} />
                    <Txt variant="caption" tone="faint" upper>{dayLabel(item.createdAt)}</Txt>
                    <View style={styles.rule} />
                  </View>
                )}
                <MessageBubble msg={item} mine={item.senderUid === user?.uid} player={player} />
              </View>
            );
          }}
          ItemSeparatorComponent={() => <View style={{ height: space.md }} />}
        />
      )}

      <View style={[styles.bar, { paddingBottom: insets.bottom + space.sm }]}>
        <Action icon="photo" label="Photo" onPress={() => router.push('/photo')} />
        <Action icon="mic" label="Talk" onPress={() => router.navigate('/home')} />
        <Action icon="text" label="Note" onPress={() => router.push('/text')} />
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md, padding: space.lg },
  list: { paddingHorizontal: space.lg, paddingVertical: space.lg, width: '100%', maxWidth: 640, alignSelf: 'center' },
  day: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginVertical: space.md },
  rule: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.16)' },
  bar: {
    flexDirection: 'row', justifyContent: 'space-around', paddingTop: space.sm,
    borderTopWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.16)', backgroundColor: brand.black,
  },
  action: { minWidth: 88, minHeight: 64, alignItems: 'center', justifyContent: 'center', gap: 6 },
});
