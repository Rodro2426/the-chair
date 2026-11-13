import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { space } from '@/theme/tokens';
import { GlossyButton, IconBadge, Txt } from '@/components/ui';

/** Shown when the family member has no chair linked yet. */
export function EmptyChairState({ name }: { name?: string }) {
  return (
    <View style={styles.wrap}>
      <Animated.View entering={FadeInDown.springify().damping(14)}>
        <IconBadge name="chair" accent="voice" size={112} />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(80).springify().damping(14)} style={{ gap: space.md }}>
        <Txt variant="display" align="center">{name ? `Hi ${name}!\n` : ''}Let’s find{'\n'}the chair.</Txt>
        <Txt variant="body" tone="muted" align="center">
          Turn on the chair’s screen and tap “Pair a phone”. Then type the 6-digit code you see.
        </Txt>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(160).springify().damping(14)} style={{ alignSelf: 'stretch' }}>
        <GlossyButton title="Link a chair" icon="link" accent="voice" onPress={() => router.push('/link')} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.xl, padding: space.lg },
});
