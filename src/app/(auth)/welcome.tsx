import { ScrollView, StyleSheet, View } from 'react-native';
import { router, type Href } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, space } from '@/theme/tokens';
import { Card, GlossyButton, Icon, IconBadge, PressableScale, ScreenBackground, Txt } from '@/components/ui';
import { setDeviceMode } from '@/hooks/deviceMode';

const enter = (i: number) => FadeInDown.delay(80 * i).springify().damping(15);

export default function Welcome() {
  const insets = useSafeAreaInsets();

  const pickChair = async () => {
    await setDeviceMode('chair');
    router.replace('/chair' as Href);
  };

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + space.xxl, paddingBottom: insets.bottom + space.xl }]}>
        <Animated.View entering={enter(0)}>
          <IconBadge name="chair" accent="voice" size={84} />
        </Animated.View>
        <Animated.View entering={enter(1)} style={{ gap: space.md }}>
          <Txt variant="display" style={styles.hero}>Your voice,{'\n'}right in{'\n'}their chair.</Txt>
          <Txt variant="body" tone="muted" style={{ fontSize: 18, lineHeight: 26 }}>
            Send voice notes, little messages and a photo of the day. The chair plays them out loud — no phone needed.
          </Txt>
        </Animated.View>

        <View style={{ flex: 1, minHeight: space.xl }} />

        <Animated.View entering={enter(2)} style={{ gap: space.md }}>
          <Txt variant="caption" tone="faint" upper>Who’s using this device?</Txt>
          <GlossyButton title="I’m family" icon="family" accent="voice" onPress={() => router.push('/sign-up')} />
          <PressableScale onPress={() => router.push('/sign-in')} style={styles.link} hapticStyle="select">
            <Txt variant="body" tone="muted">Already have an account? </Txt>
            <Txt variant="body" tone="primary" style={{ fontWeight: '800' }}>Sign in</Txt>
          </PressableScale>
        </Animated.View>

        <Animated.View entering={enter(3)}>
          <PressableScale onPress={pickChair} accessibilityRole="button" accessibilityLabel="This is the chair">
            <Card style={styles.chairCard}>
              <IconBadge name="chair" accent="photo" size={52} />
              <View style={{ flex: 1 }}>
                <Txt variant="heading">This is the chair</Txt>
                <Txt variant="caption" tone="muted">Set up this tablet as the grandparent’s device</Txt>
              </View>
              <Icon name="chevron" size={28} color={colors.textMuted} />
            </Card>
          </PressableScale>
        </Animated.View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingHorizontal: space.lg, gap: space.xl, maxWidth: 560, width: '100%', alignSelf: 'center' },
  hero: { fontSize: 52, lineHeight: 54, letterSpacing: -1.5 },
  link: { flexDirection: 'row', justifyContent: 'center', paddingVertical: space.sm },
  chairCard: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md },
});
