import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { brand, colors, radius, space } from '@/theme/tokens';
import { GlossyButton, Icon, PressableScale, ScreenBackground, ScreenHeader, Txt, haptic } from '@/components/ui';
import { Section } from '@/components/family';
import { useFamily } from '@/hooks/useFamily';
import { BOX, VISIT, goingLine, useLocal } from '@/lib/family';

/** This month's Story Box (tracking + theme) and the Sunday visit RSVP. */
export default function Box() {
  const insets = useSafeAreaInsets();
  const { name } = useFamily();
  const [going, setGoing] = useLocal<boolean>('rsvpSunday', false);

  return (
    <ScreenBackground>
      <View style={{ paddingTop: insets.top }}>
        <ScreenHeader title="Story Box" />
      </View>
      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + space.xxl }]}>
        <Section title={`${BOX.month} box`}>
          <View style={styles.card}>
            <Txt variant="heading">Arriving {BOX.arrives}</Txt>
            <View style={styles.steps}>
              {BOX.steps.map((step, i) => {
                const done = i <= BOX.currentStep;
                return (
                  <View key={step} style={styles.step}>
                    <View style={[styles.stepDot, done && styles.stepDotDone]}>
                      {i < BOX.currentStep ? <Icon name="check" size={14} color={brand.black} /> : null}
                    </View>
                    <Txt variant="label" tone={done ? 'default' : 'faint'} style={styles.small}>{step}</Txt>
                    {i < BOX.steps.length - 1 ? <View style={[styles.stepLine, i < BOX.currentStep && styles.stepLineDone]} /> : null}
                  </View>
                );
              })}
            </View>
            <PressableScale onPress={() => {}} hapticStyle="select" style={styles.ghost} accessibilityRole="button" accessibilityLabel="Track package">
              <Txt variant="label" style={styles.small}>Track package</Txt>
            </PressableScale>
          </View>
        </Section>

        <Section title="This month’s theme">
          <View style={styles.card}>
            <Txt variant="title" style={{ fontSize: 34, lineHeight: 40 }}>{BOX.theme}</Txt>
            <Txt variant="body" tone="muted">{BOX.activity}</Txt>
            <View style={{ gap: space.xs }}>
              {BOX.contents.map((c) => <Txt key={c} variant="label" tone="faint" style={styles.small}>· {c}</Txt>)}
            </View>
          </View>
        </Section>

        <Section title={`Visit ${name} on ${VISIT.day}`}>
          <View style={styles.card}>
            <Txt variant="heading">{goingLine(going)}</Txt>
            <View style={styles.rsvp}>
              <GlossyButton title={going ? 'I’m going ✓' : 'I’m going'} size="md" style={{ flex: 1 }}
                onPress={() => { haptic.success(); setGoing(true); }} />
              <PressableScale onPress={() => setGoing(false)} hapticStyle="select" style={[styles.ghost, styles.cant]}
                accessibilityRole="button" accessibilityLabel="Can't make it">
                <Txt variant="label" style={styles.small}>Can’t make it</Txt>
              </PressableScale>
            </View>
          </View>
        </Section>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: space.lg, gap: space.xl, width: '100%', maxWidth: 640, alignSelf: 'center' },
  card: { gap: space.lg, padding: space.lg, borderRadius: radius.sm, borderWidth: 1, borderColor: brand.divider, backgroundColor: colors.bgElevated },
  small: { fontSize: 12, letterSpacing: 1.4 },
  steps: { flexDirection: 'row' },
  step: { flex: 1, alignItems: 'center', gap: space.sm },
  stepDot: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: brand.greyDark, alignItems: 'center', justifyContent: 'center', zIndex: 1, backgroundColor: colors.bgElevated },
  stepDotDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  stepLine: { position: 'absolute', top: 11, left: '50%', right: '-50%', height: 2, backgroundColor: brand.greyDark },
  stepLineDone: { backgroundColor: colors.primary },
  ghost: { alignItems: 'center', justifyContent: 'center', minHeight: 48, paddingHorizontal: space.md, borderWidth: 1, borderColor: brand.divider, borderRadius: radius.sm },
  rsvp: { flexDirection: 'row', gap: space.md, alignItems: 'center' },
  cant: { flex: 1, minHeight: 56 },
});
