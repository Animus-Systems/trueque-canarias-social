import { startTransition, useState } from 'react';
import { api } from '../api';
import { readErrorMessage } from '../utils';

interface FeedbackActions {
  updateItem: (id: string, updates: Record<string, unknown>) => void;
  removeItem: (id: string) => void;
  setMessage: (msg: string | null) => void;
  setGlobalError: (msg: string | null) => void;
}

export function useFeedback(actions: FeedbackActions) {
  const [votingId, setVotingId] = useState<string | null>(null);
  const [reasonPromptId, setReasonPromptId] = useState<string | null>(null);
  const [reasonText, setReasonText] = useState('');
  const [flaggingId, setFlaggingId] = useState<string | null>(null);
  const [flagReasonText, setFlagReasonText] = useState('');

  async function handleVote(
    equivalentId: string,
    voteType: 'helpful' | 'not_helpful',
    reason?: string
  ): Promise<void> {
    setVotingId(equivalentId);
    actions.setGlobalError(null);

    try {
      const response = await api.feedback.vote.mutate({
        equivalentId,
        voteType,
        reason: reason || undefined,
      });

      startTransition(() => {
        if (response.promptContext && !reason) {
          setReasonPromptId(equivalentId);
        } else {
          setReasonPromptId(null);
          setReasonText('');
        }

        if (response.newScore !== null) {
          actions.updateItem(equivalentId, {
            confidenceScore: response.newScore,
            helpfulVotes: response.helpfulVotes ?? undefined,
            notHelpfulVotes: response.notHelpfulVotes ?? undefined,
          });
        }

        if (response.message) {
          actions.setMessage(response.message);
        }
      });
    } catch (error) {
      actions.setGlobalError(readErrorMessage(error));
    } finally {
      setVotingId(null);
    }
  }

  function handleReasonSubmit(equivalentId: string) {
    void handleVote(equivalentId, 'not_helpful', reasonText);
    setReasonPromptId(null);
    setReasonText('');
  }

  function handleReasonDismiss() {
    setReasonPromptId(null);
    setReasonText('');
  }

  async function handleFlag(equivalentId: string, reason: string): Promise<void> {
    actions.setGlobalError(null);

    try {
      const response = await api.flags.create.mutate({ equivalentId, reason });

      startTransition(() => {
        actions.setMessage(response.message);
        setFlaggingId(null);
        setFlagReasonText('');

        if (response.autoRejected) {
          actions.removeItem(equivalentId);
        }
      });
    } catch (error) {
      actions.setGlobalError(readErrorMessage(error));
    }
  }

  function handleFlagStart(equivalentId: string) {
    setFlaggingId(equivalentId);
    setFlagReasonText('');
  }

  function handleFlagDismiss() {
    setFlaggingId(null);
    setFlagReasonText('');
  }

  return {
    votingId, reasonPromptId, reasonText, flaggingId, flagReasonText,
    handleVote, handleReasonSubmit, handleReasonDismiss,
    handleFlag, handleFlagStart, handleFlagDismiss,
    setReasonText: setReasonText,
    setFlagReasonText: setFlagReasonText,
  };
}
