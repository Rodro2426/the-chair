import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { brand, colors, radius, space } from '@/theme/tokens';
import { GlossyButton, Icon, PressableScale, Txt } from '@/components/ui';
import { Section, StoryCard, TabScreen } from '@/components/family';
import { useFamily } from '@/hooks/useFamily';
import { useMessagePlayer } from '@/hooks/useMessagePlayer';
import { BOX, VISIT, questionOfTheDay, questionText, useHearts } from '@/lib/family';

/** Home: "This week at grandpa's chair" — today's question, the newest story, the next box and visit. */
export default function Home() {
  const { chair, name, stories, questions } = useFamily();
  const player = useMessagePlayer();
  const hearts = useHearts();
  const today = questionOfTheDay();
  // Today's question: the latest one the family asked, otherwise the suggestion of the day.
  const latest = questions[0];
  const qText = latest ? questionText(latest.msg) : today.q;
  const answered = latest?.answered ?? false;
  const newest = stories[0];

  return (
    <TabScreen kicker="This week at" title={`${name}’s chair`}>
      {!chair ? (
        <PressableScale onPress={() => router.push('/link')} style={styles.card} accessibilityRole="button">
          <Txt variant="heading">Link the chair first</Txt>
          <Txt variant="body" tone="muted">Enter the 6-digit code shown on the chair to connect your family.</Txt>
        </PressableScale>
      ) : null}

      <Section title="Today’s question">
        <View style={styles.card}>
          <Txt variant="title" style={styles.quote}>“{qText}”</Txt>
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: answered ? colors.primary : colors.textFaint }]} />
            <Txt variant="label" tone={answered ? 'default' : 'muted'} style={styles.small}>
              {latest ? (answered ? `${name} answered` : `Waiting for ${name}`) : 'Not asked yet'}
            </Txt>
          </View>
          <GlossyButton
            title={latest ? 'Ask another question' : 'Ask this question'}
            size="md"
            onPress={() => router.push({ pathname: '/ask', params: latest ? {} : { q: today.q } })}
          />
        </View>
      </Section>

      <Section title="Newest story" action={
        <PressableScale onPress={() => router.replace('/stories')} hapticStyle="select" accessibilityRole="link">
          <Txt variant="label" style={styles.small}>All stories</Txt>
        </PressableScale>
      }>
        {newest ? (
          <StoryCard story={newest} player={player} hearted={hearts.has(newest.id)} onHeart={() => hearts.toggle(newest.id)} compact />
        ) : null}
      </Section>

      <PressableScale onPress={() => router.push('/box')} style={[styles.card, styles.reminder]} accessibilityRole="button"
        accessibilityLabel={`Next box arrives ${BOX.arrives}. Visit on ${VISIT.day}?`}>
        <Icon name="box" size={26} color={colors.text} />
        <View style={{ flex: 1, gap: 2 }}>
          <Txt variant="heading">Next box arrives {BOX.arrives}</Txt>
          <Txt variant="label" tone="muted" style={styles.small}>Visit on {VISIT.day}?</Txt>
        </View>
        <Icon name="chevron" size={20} color={colors.textFaint} />
      </PressableScale>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  card: { gap: space.md, padding: space.lg, borderRadius: radius.sm, borderWidth: 1, borderColor: brand.divider, backgroundColor: colors.bgElevated },
  quote: { fontSize: 32, lineHeight: 38 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  dot: { width: 8, height: 8, borderRadius: 4 },
  small: { fontSize: 12, letterSpacing: 1.4 },
  reminder: { flexDirection: 'row', alignItems: 'center' },
});
