// Family-side content for The Chair: questions, stories, the monthly Story Box, Sunday visits.
//
// Real today (uses the chair connection that already works):
//   - Questions are sent to the chair as text messages that start with "Question: " — the chair
//     reads them out loud.
//   - Stories are the voice replies grandpa records on the chair.
// Placeholders (need a cloud service later): transcripts, notifications, box tracking, shared
// hearts/comments/RSVPs. Hearts and the RSVP are remembered on this phone only.
import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Chair, ChairMessage } from '@/types';

export const QUESTION_PREFIX = 'Question: ';
export const isQuestion = (m: ChairMessage) => m.type === 'text' && !!m.text?.startsWith(QUESTION_PREFIX);
export const questionText = (m: ChairMessage) => (m.text ?? '').slice(QUESTION_PREFIX.length);

export type Topic = 'Childhood' | 'Work' | 'Love' | 'Travel' | 'New';
export const TOPICS: Topic[] = ['Childhood', 'Work', 'Love', 'Travel'];

export const SUGGESTED_QUESTIONS: { q: string; topic: Topic }[] = [
  { q: 'What was your first job?', topic: 'Work' },
  { q: 'What did your house smell like when you were a child?', topic: 'Childhood' },
  { q: 'How did you meet grandma?', topic: 'Love' },
  { q: 'What was the best trip you ever took?', topic: 'Travel' },
  { q: 'What games did you play with your friends?', topic: 'Childhood' },
  { q: 'Who taught you the most at work?', topic: 'Work' },
  { q: 'What song reminds you of being young?', topic: 'Love' },
  { q: 'Where would you go again if you could?', topic: 'Travel' },
];

/** The question of the day rotates through the suggestions. */
export function questionOfTheDay(now = new Date()) {
  const day = Math.floor(now.getTime() / 86_400_000);
  return SUGGESTED_QUESTIONS[day % SUGGESTED_QUESTIONS.length];
}

export interface Story {
  id: string;
  title: string;
  topic: Topic;
  createdAt: number;
  durationMs?: number;
  transcript?: string; // undefined = not transcribed yet
  msg?: ChairMessage; // real voice reply (playable); undefined for examples
  example?: boolean;
}

const day = 86_400_000;
export const EXAMPLE_STORIES: Story[] = [
  {
    id: 'ex-bakery', title: 'The bakery on Calle Mayor', topic: 'Work', createdAt: Date.now() - 2 * day, durationMs: 194_000, example: true,
    transcript: 'My first job was at the bakery on Calle Mayor. I was fourteen. I started at four in the morning, and the owner, Don Julián, paid me in bread and a few coins. In 1968 he let me run the oven by myself for the first time.',
  },
  {
    id: 'ex-dance', title: 'The dance in the plaza', topic: 'Love', createdAt: Date.now() - 6 * day, durationMs: 241_000, example: true,
    transcript: 'I met your grandmother at the summer dance in the plaza. She was wearing a yellow dress and she laughed at my shoes. I asked her to dance three times before she said yes.',
  },
  {
    id: 'ex-river', title: 'Summers at the river', topic: 'Childhood', createdAt: Date.now() - 11 * day, durationMs: 156_000, example: true,
    transcript: 'Every summer we went to the river behind my uncle\'s farm. We caught fish with our hands and came home sunburned. My mother pretended to be angry but she always saved us the biggest plate.',
  },
  {
    id: 'ex-train', title: 'The night train to Lisbon', topic: 'Travel', createdAt: Date.now() - 19 * day, durationMs: 212_000, example: true,
    transcript: 'In 1975 we took the night train to Lisbon with almost no money. We slept sitting up and shared bread with a family from Porto. When we arrived the sea was the bluest thing I had ever seen.',
  },
];

/** Grandpa's real voice replies from the chair become stories (newest first). Examples fill in until then. */
export function buildStories(messages: ChairMessage[], chair: Chair | null): { stories: Story[]; usingExamples: boolean } {
  if (!chair) return { stories: EXAMPLE_STORIES, usingExamples: true };
  const replies = messages.filter((m) => m.type === 'voice' && m.senderUid === chair.deviceUid);
  if (replies.length === 0) return { stories: EXAMPLE_STORIES, usingExamples: true };
  const questions = messages.filter(isQuestion);
  const stories = replies.map((m) => {
    // A reply answers the most recent question asked before it.
    const q = questions.find((x) => x.createdAt < m.createdAt);
    const sugg = q && SUGGESTED_QUESTIONS.find((s) => s.q === questionText(q));
    return {
      id: m.id,
      title: q ? questionText(q) : `A story from ${new Date(m.createdAt).toLocaleDateString([], { month: 'long', day: 'numeric' })}`,
      topic: sugg?.topic ?? 'New',
      createdAt: m.createdAt,
      durationMs: m.durationMs,
      msg: m,
    } satisfies Story;
  });
  return { stories, usingExamples: false };
}

/** True once grandpa has recorded a reply after this question was asked. */
export function isAnswered(question: ChairMessage, messages: ChairMessage[], chair: Chair | null) {
  return !!chair && messages.some((m) => m.type === 'voice' && m.senderUid === chair.deviceUid && m.createdAt > question.createdAt);
}

// ---------- Story Box (placeholder data until shipping is connected) ----------

export const BOX = {
  month: 'November',
  theme: 'The kitchen table',
  activity: 'Cook grandma\'s rice pudding together and ask: who taught you to cook?',
  contents: ['Recipe card', 'Old-photo postcards', '3 question cards'],
  steps: ['Shipped', 'Arriving', 'Delivered'] as const,
  currentStep: 1, // 0 shipped, 1 arriving, 2 delivered
  arrives: 'Friday',
};

export const VISIT = { day: 'Sunday', others: ['Laura', 'Mateo'] };

export function goingLine(going: boolean) {
  const names = [...(going ? ['You'] : []), ...VISIT.others];
  if (names.length === 1) return `${names[0]} is going`;
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]} are going`;
}

// ---------- remembered on this phone ----------

/** A small persisted value (AsyncStorage). Hearts, RSVP, notification preference. */
export function useLocal<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  useEffect(() => {
    AsyncStorage.getItem(`thechair.${key}`).then((v) => { if (v != null) setValue(JSON.parse(v)); }).catch(() => {});
  }, [key]);
  const set = useCallback((v: T) => {
    setValue(v);
    AsyncStorage.setItem(`thechair.${key}`, JSON.stringify(v)).catch(() => {});
  }, [key]);
  return [value, set] as const;
}

export function useHearts() {
  const [ids, setIds] = useLocal<string[]>('hearts', []);
  const set = useMemo(() => new Set(ids), [ids]);
  const toggle = useCallback((id: string) => setIds(set.has(id) ? ids.filter((x) => x !== id) : [...ids, id]), [ids, set, setIds]);
  return { has: (id: string) => set.has(id), toggle };
}

export const fmtDate = (ms: number) => new Date(ms).toLocaleDateString([], { month: 'short', day: 'numeric' }).toUpperCase();
