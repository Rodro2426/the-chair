import { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { brand, colors, fonts, radius, space } from '@/theme/tokens';
import { Icon, PressableScale, Txt } from '@/components/ui';
import { Section, StoryCard, TabScreen } from '@/components/family';
import { useFamily } from '@/hooks/useFamily';
import { useMessagePlayer } from '@/hooks/useMessagePlayer';
import { TOPICS, useHearts, type Story, type Topic } from '@/lib/family';

type Sort = 'date' | 'topic';

/** The family podcast: every story, searchable by its transcript, sorted by date or by topic. */
export default function Stories() {
  const { name, stories, usingExamples } = useFamily();
  const player = useMessagePlayer();
  const hearts = useHearts();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('date');
  const [topic, setTopic] = useState<Topic | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return stories
      .filter((s) => !topic || s.topic === topic)
      .filter((s) => !q || `${s.title} ${s.transcript ?? ''} ${new Date(s.createdAt).getFullYear()}`.toLowerCase().includes(q))
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [stories, query, topic]);

  const groups = useMemo(() => {
    if (sort === 'date') return [{ title: `${filtered.length} ${filtered.length === 1 ? 'story' : 'stories'}`, items: filtered }];
    const order: Topic[] = [...TOPICS, 'New'];
    return order.map((t) => ({ title: t, items: filtered.filter((s) => s.topic === t) })).filter((g) => g.items.length);
  }, [filtered, sort]);

  const card = (s: Story) => (
    <StoryCard key={s.id} story={s} player={player} hearted={hearts.has(s.id)} onHeart={() => hearts.toggle(s.id)} />
  );

  return (
    <TabScreen kicker="The family podcast" title={`${name}’s stories`}>
      <View style={styles.search}>
        <Icon name="search" size={20} color={colors.textFaint} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search: bakery, 1968…"
          placeholderTextColor={colors.textFaint}
          style={styles.input}
          autoCorrect={false}
          accessibilityLabel="Search stories"
        />
      </View>

      <View style={styles.chips}>
        <Chip label="By date" active={sort === 'date'} onPress={() => setSort('date')} />
        <Chip label="By topic" active={sort === 'topic'} onPress={() => setSort('topic')} />
      </View>
      <View style={styles.chips}>
        <Chip label="All" active={!topic} onPress={() => setTopic(null)} />
        {TOPICS.map((t) => <Chip key={t} label={t} active={topic === t} onPress={() => setTopic(topic === t ? null : t)} />)}
      </View>

      {usingExamples ? (
        <Txt variant="body" tone="faint">These are example stories. When {name} answers a question on the chair, the real recording appears here.</Txt>
      ) : null}

      {groups.length === 0 ? <Txt variant="body" tone="muted">No stories match “{query}”.</Txt> : null}
      {groups.map((g) => (
        <Section key={g.title} title={g.title}>
          {g.items.map(card)}
        </Section>
      ))}
    </TabScreen>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <PressableScale onPress={onPress} hapticStyle="select" accessibilityRole="button" accessibilityState={{ selected: active }}
      style={[styles.chip, active && styles.chipActive]}>
      <Txt variant="label" style={[styles.chipText, { color: active ? brand.black : colors.text }]}>{label}</Txt>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md, minHeight: 52,
    borderWidth: 1, borderColor: brand.divider, borderRadius: radius.sm, backgroundColor: colors.bgElevated,
  },
  input: { flex: 1, fontFamily: fonts.mono, fontSize: 17, color: colors.text, paddingVertical: space.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: -space.md },
  chip: { paddingHorizontal: space.md, minHeight: 40, justifyContent: 'center', borderRadius: radius.sm, borderWidth: 1, borderColor: brand.divider },
  chipActive: { backgroundColor: colors.text, borderColor: colors.text },
  chipText: { fontSize: 12, letterSpacing: 1.4 },
});
