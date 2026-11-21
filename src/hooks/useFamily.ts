import { useMemo } from 'react';
import { useChairs } from './useChairs';
import { useMessages } from './useMessages';
import { useAuth } from './useAuth';
import { buildStories, isAnswered, isQuestion } from '@/lib/family';
import { shortName } from '@/components/family/format';

/** Everything the family tabs need, derived from the selected chair's live messages. */
export function useFamily() {
  const { user } = useAuth();
  const { chairs, selected, loading } = useChairs();
  const { messages } = useMessages(selected?.id, 300);
  return useMemo(() => {
    const { stories, usingExamples } = buildStories(messages, selected);
    const questions = messages.filter(isQuestion).map((q) => ({ msg: q, answered: isAnswered(q, messages, selected) }));
    return {
      user,
      chairs,
      chair: selected,
      loading,
      messages,
      stories,
      usingExamples,
      questions, // newest first
      name: selected ? shortName(selected.name) : 'Grandpa',
    };
  }, [user, chairs, selected, loading, messages]);
}
