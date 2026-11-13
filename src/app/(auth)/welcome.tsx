import { StyleSheet, View } from 'react-native';
import { router, type Href } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, space } from '@/theme/tokens';
import { GlossyButton, Icon, PressableScale, ScreenBackground, Sphere, Txt } from '@/components/ui';
import { setDeviceMode } from '@/hooks/deviceMode';

const enter = (i: number) => FadeInDown.delay(90 * i).duration(500);

export default function Welcome() {
  const insets = useSafeAreaInsets();

  const pickChair = async () => {
    await setDeviceMode('chair');
    router.replace('/chair' as Href);
  };

  return (
    <ScreenBackground>
      <View style={[styles.content, { paddingTop: insets.top + space.lg, paddingBottom: insets.bottom + space.lg }]}>
        <Animated.View entering={FadeIn.duration(600)} style={styles.top}>
          <Txt variant="label" style={styles.wordmark}>The Chair</Txt>
        </Animated.View>

        <View style={styles.hero}>
          <Animated.View entering={FadeIn.duration(900)} style={styles.mark}>
            <Sphere size={64} ring={6} />
          </Animated.View>
          <Animated.View entering={enter(1)}>
            <Txt variant="label" tone="faint" style={{ marginBottom: space.md }}>Voice · Photo · Note</Txt>
            <Txt variant="display" style={styles.headline}>Your voice,{'\n'}in their chair.</Txt>
          </Animated.View>
          <Animated.View entering={enter(2)}>
            <Txt variant="body" tone="muted" style={styles.lede}>
              Hold to talk. The chair plays it out loud. No phone needed on their side.
            </Txt>
          </Animated.View>
        </View>

        <Animated.View entering={enter(3)} style={{ gap: space.md }}>
          <GlossyButton title="I'm family" onPress={() => router.push('/sign-up')} />
          <PressableScale onPress={pickChair} hapticStyle="select" pressedScale={0.98}
            accessibilityRole="button" accessibilityLabel="This is the chair" style={styles.secondary}>
            <Txt variant="label" style={{ fontSize: 14 }}>This is the chair</Txt>
            <Icon name="chevron" size={16} strokeWidth={2.4} />
          </PressableScale>
          <PressableScale onPress={() => router.push('/sign-in')} hapticStyle="select" style={styles.link}>
            <Txt variant="label" tone="faint" style={styles.small}>Have an account?</Txt>
            <View>
              <Txt variant="label" style={styles.small}>Sign in</Txt>
              <View style={styles.underline} />
            </View>
          </PressableScale>
        </Animated.View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: space.lg, maxWidth: 560, width: '100%', alignSelf: 'center' },
  top: { alignItems: 'center', paddingVertical: space.md },
  wordmark: { fontSize: 13, letterSpacing: 5 },
  hero: { flex: 1, justifyContent: 'center', gap: space.lg },
  mark: { marginBottom: space.lg },
  headline: { fontSize: 64, lineHeight: 66, letterSpacing: -0.5 },
  lede: { maxWidth: 320 },
  secondary: {
    height: 56, borderRadius: radius.sm, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm,
  },
  link: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', gap: space.sm, paddingVertical: space.sm },
  small: { fontSize: 13, letterSpacing: 1.6 },
  underline: { height: 2, width: 20, backgroundColor: colors.primary, marginTop: 4 },
});
