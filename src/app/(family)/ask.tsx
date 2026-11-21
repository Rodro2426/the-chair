import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { brand, colors, fonts, radius, space } from '@/theme/tokens';
import { GlossyButton, Icon, PressableScale, Txt, haptic, useToast } from '@/components/ui';
import { Section, TabScreen } from '@/components/family';
import { useFamily } from '@/hooks/useFamily';
import { friendlyError } from '@/hooks/errors';
import { sendText } from '@/lib/api';
import { QUESTION_PREFIX, SUGGESTED_QUESTIONS, fmtDate, questionText, useLocal } from '@/lib/family';

/** Ask grandpa a question: it goes into the chair's queue and is read out loud. */
export default function Ask() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const { chair, name, questions } = useFamily();
  const toast = useToast();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [notify, setNotify] = useLocal('notifyAnswers', true);

  useEffect(() => { if (q) setText(q); }, [q]);

  const send = async () => {
    const clean = text.trim();
    if (!clean || busy) return;
    if (!chair) { router.push('/link'); return; }
    setBusy(true);
    try {
      await sendText(chair.id, QUESTION_PREFIX + clean);
      haptic.success();
      toast.show(`Sent. ${name} will hear it on the chair.`);
      setText('');
    } catch (e) {
      toast.show(friendlyError(e, 'Couldn’t send the question. Please try again.'), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <TabScreen kicker="Ask" title={`A question for ${name}`}>
      <View style={styles.compose}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={`What would you like to ask ${name}?`}
          placeholderTextColor={colors.textFaint}
          multiline
          maxLength={280}
          style={styles.input}
          accessibilityLabel="Your question"
        />
        <GlossyButton title={busy ? 'Sending' : 'Send to the chair'} loading={busy} disabled={!text.trim()} onPress={send} />
        <Txt variant="label" tone="faint" style={styles.small}>The chair reads it out loud. Anyone in the family can ask.</Txt>
      </View>

      <Section title="Not sure what to ask?">
        <View style={styles.suggestions}>
          {SUGGESTED_QUESTIONS.map((s) => (
            <PressableScale key={s.q} onPress={() => setText(s.q)} hapticStyle="select" style={styles.suggestion}
              accessibilityRole="button" accessibilityLabel={`Use question: ${s.q}`}>
              <Txt variant="body" style={{ flex: 1 }}>{s.q}</Txt>
              <Txt variant="label" tone="faint" style={styles.small}>{s.topic.toUpperCase()}</Txt>
            </PressableScale>
          ))}
        </View>
      </Section>

      <PressableScale onPress={() => setNotify(!notify)} hapticStyle="select" style={styles.notify}
        accessibilityRole="switch" accessibilityState={{ checked: notify }}>
        <Icon name="bell" size={22} color={colors.text} />
        <View style={{ flex: 1, gap: 2 }}>
          <Txt variant="heading" style={{ fontSize: 16 }}>Tell me when {name} answers</Txt>
          <Txt variant="label" tone="faint" style={styles.small}>“{name} answered your question.”</Txt>
        </View>
        <View style={[styles.switch, notify && styles.switchOn]}>
          <View style={[styles.knob, notify && styles.knobOn]} />
        </View>
      </PressableScale>

      {questions.length ? (
        <Section title="Asked so far">
          {questions.slice(0, 20).map(({ msg, answered }) => (
            <View key={msg.id} style={styles.asked}>
              <Txt variant="body" style={{ flex: 1 }}>{questionText(msg)}</Txt>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Txt variant="label" tone={answered ? 'default' : 'faint'} style={styles.small}>{answered ? 'Answered' : 'Waiting'}</Txt>
                <Txt variant="label" tone="faint" style={styles.small}>{msg.senderName.toUpperCase()} · {fmtDate(msg.createdAt)}</Txt>
              </View>
            </View>
          ))}
        </Section>
      ) : null}
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  compose: { gap: space.md },
  input: {
    minHeight: 120, padding: space.md, fontFamily: fonts.serif, fontSize: 26, lineHeight: 32, color: colors.text,
    borderWidth: 1, borderColor: brand.divider, borderRadius: radius.sm, backgroundColor: colors.bgElevated, textAlignVertical: 'top',
  },
  small: { fontSize: 12, letterSpacing: 1.4 },
  suggestions: { gap: 0 },
  suggestion: {
    flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md, minHeight: 56,
    borderBottomWidth: StyleSheet.hairlineWidth, borderColor: brand.divider,
  },
  notify: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, borderRadius: radius.sm, borderWidth: 1, borderColor: brand.divider },
  switch: { width: 48, height: 28, borderRadius: 14, backgroundColor: brand.greyDark, padding: 3 },
  switchOn: { backgroundColor: colors.primary },
  knob: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.text },
  knobOn: { transform: [{ translateX: 20 }] },
  asked: { flexDirection: 'row', gap: space.md, paddingVertical: space.md, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: brand.divider },
});
