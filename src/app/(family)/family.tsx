import { Platform, Share, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { brand, colors, radius, space } from '@/theme/tokens';
import { GlossyButton, Icon, ListRow, ListSection, Txt, useToast } from '@/components/ui';
import { Section, TabScreen } from '@/components/family';
import { useFamily } from '@/hooks/useFamily';

const APP_URL = 'https://rodro2426.github.io/the-chair/';

/** Family members: invite children and grandchildren with a link. Everyone can listen and ask. */
export default function Family() {
  const { user, chair, name } = useFamily();
  const toast = useToast();
  const others = Math.max(0, (chair?.memberUids.length ?? 1) - 1);

  const invite = async () => {
    const message = `Join our family on The Chair to hear ${name}'s stories and ask questions: ${APP_URL}`;
    try {
      if (Platform.OS === 'web') {
        const nav = globalThis.navigator as Navigator | undefined;
        if (nav?.share) { await nav.share({ title: 'The Chair', text: message, url: APP_URL }); return; }
        await nav?.clipboard?.writeText(message);
        toast.show('Invite link copied. Paste it in a message to your family.');
        return;
      }
      await Share.share({ message });
    } catch {
      // Share sheet dismissed — nothing to do.
    }
  };

  return (
    <TabScreen kicker="Family" title="Who’s listening">
      <View style={styles.card}>
        <Icon name="family" size={28} color={colors.text} />
        <Txt variant="heading">Invite children and grandchildren</Txt>
        <Txt variant="body" tone="muted">Everyone on the plan can listen to {name}’s stories and ask questions.</Txt>
        <GlossyButton title="Share invite link" icon="link" onPress={invite} />
        <Txt variant="label" tone="faint" style={styles.small}>They open the link, create an account, and link the chair with its 6-digit code.</Txt>
      </View>

      <Section title={chair ? `On ${name}’s chair` : 'Members'}>
        <View style={styles.member}>
          <View style={styles.avatar}><Txt variant="label">{(user?.displayName || 'Y').slice(0, 1).toUpperCase()}</Txt></View>
          <Txt variant="body" style={{ flex: 1 }}>{user?.displayName || 'You'} (you)</Txt>
        </View>
        {others > 0 ? (
          <View style={styles.member}>
            <View style={styles.avatar}><Txt variant="label">+{others}</Txt></View>
            <Txt variant="body" tone="muted" style={{ flex: 1 }}>{others} more family {others === 1 ? 'member' : 'members'}</Txt>
          </View>
        ) : (
          <Txt variant="body" tone="faint">No one else yet. Share the invite link above.</Txt>
        )}
      </Section>

      <ListSection title="More">
        <ListRow label="Message history" hint="Everything sent to the chair" onPress={() => router.push('/history')} />
        <ListRow label="Photo of the day" hint="Shown big on the chair" onPress={() => router.push('/photo')} />
        <ListRow label="Settings" hint="Your name, linked chairs, volume" onPress={() => router.push('/settings')} />
      </ListSection>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  card: { gap: space.md, padding: space.lg, borderRadius: radius.sm, borderWidth: 1, borderColor: brand.divider, backgroundColor: colors.bgElevated },
  small: { fontSize: 12, letterSpacing: 1.4 },
  member: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 56 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: brand.black, alignItems: 'center', justifyContent: 'center' },
});
