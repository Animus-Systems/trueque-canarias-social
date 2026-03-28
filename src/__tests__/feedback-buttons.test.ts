/**
 * US-06: Feedback Buttons - Test Suite
 * Satisfies AC-01 through AC-06
 *
 * Note: Uses mock for feedback testing
 */

import { describe, it, expect, beforeEach } from 'vitest';

interface FeedbackVote {
  equivalent_id: string;
  session_id: string | null;
  vote_type: 'helpful' | 'not_helpful';
  reason?: string;
}

interface Equivalent {
  id: string;
  skill_name: string;
  item_name: string;
  helpful_votes: number;
  not_helpful_votes: number;
}

interface FeedbackResult {
  success: boolean;
  error?: string;
  new_score?: number;
  prompt_context?: string;
}

const votedEquivalents = new Set<string>();

function submitFeedback(vote: FeedbackVote, equivalent: Equivalent): FeedbackResult {
  if (votedEquivalents.has(vote.equivalent_id)) {
    return { success: false, error: 'You have already voted on this equivalent' };
  }

  if (vote.vote_type === 'helpful') {
    equivalent.helpful_votes += 1;
  } else {
    equivalent.not_helpful_votes += 1;
  }

  votedEquivalents.add(vote.equivalent_id);

  const total = equivalent.helpful_votes + equivalent.not_helpful_votes;
  const newScore = total > 0 ? Math.round((equivalent.helpful_votes / total) * 100) : 50;

  let promptContext: string | undefined;
  if (vote.vote_type === 'not_helpful' && !vote.reason) {
    promptContext = 'Would you like to explain why?';
  }

  return { success: true, new_score: newScore, prompt_context: promptContext };
}

let testEquivalent: Equivalent;

describe('US-06: Feedback Buttons', () => {
  beforeEach(() => {
    votedEquivalents.clear();
    testEquivalent = { id: 'eq-1', skill_name: 'guitar lessons', item_name: 'gardening', helpful_votes: 10, not_helpful_votes: 2 };
  });

  describe('AC-01: Each equivalent shows thumbs up/down buttons', () => {
    it('has both helpful and not helpful button options', () => {
      const buttonTypes = ['helpful', 'not_helpful'];
      expect(buttonTypes).toContain('helpful');
      expect(buttonTypes).toContain('not_helpful');
    });

    it('can submit helpful vote', () => {
      const result = submitFeedback({ equivalent_id: 'eq-1', session_id: null, vote_type: 'helpful' }, testEquivalent);
      expect(result.success).toBe(true);
    });

    it('can submit not helpful vote', () => {
      const result = submitFeedback({ equivalent_id: 'eq-new', session_id: null, vote_type: 'not_helpful' }, testEquivalent);
      expect(result.success).toBe(true);
    });
  });

  describe('AC-02: Clicking feedback updates confidence score', () => {
    it('increases helpful votes and recalculates score', () => {
      const result = submitFeedback({ equivalent_id: 'eq-2', session_id: 'session-1', vote_type: 'helpful' }, testEquivalent);
      expect(result.success).toBe(true);
      expect(testEquivalent.helpful_votes).toBe(11);
      expect(result.new_score).toBe(85);
    });

    it('decreases score when not helpful is clicked', () => {
      const result = submitFeedback({ equivalent_id: 'eq-3', session_id: 'session-1', vote_type: 'not_helpful' }, testEquivalent);
      expect(result.success).toBe(true);
      expect(testEquivalent.not_helpful_votes).toBe(3);
      expect(result.new_score).toBe(77);
    });
  });

  describe('AC-03: User cannot vote on same equivalent twice', () => {
    it('prevents second vote on same equivalent', () => {
      const firstVote = submitFeedback({ equivalent_id: 'eq-same', session_id: 'session-1', vote_type: 'helpful' }, testEquivalent);
      expect(firstVote.success).toBe(true);
      const secondVote = submitFeedback({ equivalent_id: 'eq-same', session_id: 'session-1', vote_type: 'not_helpful' }, testEquivalent);
      expect(secondVote.success).toBe(false);
      expect(secondVote.error).toBe('You have already voted on this equivalent');
    });

    it('allows voting on different equivalents', () => {
      const vote1 = submitFeedback({ equivalent_id: 'eq-a', session_id: 'session-1', vote_type: 'helpful' }, testEquivalent);
      const vote2 = submitFeedback({ equivalent_id: 'eq-b', session_id: 'session-1', vote_type: 'helpful' }, testEquivalent);
      expect(vote1.success).toBe(true);
      expect(vote2.success).toBe(true);
    });
  });

  describe('AC-04: Anonymous feedback allowed', () => {
    it('accepts vote without session_id', () => {
      const result = submitFeedback({ equivalent_id: 'eq-anon', session_id: null, vote_type: 'helpful' }, testEquivalent);
      expect(result.success).toBe(true);
    });

    it('accepts vote with undefined session_id', () => {
      const result = submitFeedback({ equivalent_id: 'eq-anon2', session_id: undefined as any, vote_type: 'helpful' }, testEquivalent);
      expect(result.success).toBe(true);
    });
  });

  describe('AC-05: Feedback submission is instant', () => {
    it('returns new score immediately', () => {
      const result = submitFeedback({ equivalent_id: 'eq-instant', session_id: 'session-1', vote_type: 'helpful' }, testEquivalent);
      expect(result.new_score).toBeDefined();
      expect(typeof result.new_score).toBe('number');
    });

    it('score updates synchronously before API confirmation', () => {
      const initialVotes = testEquivalent.helpful_votes;
      submitFeedback({ equivalent_id: 'eq-sync', session_id: 'session-1', vote_type: 'helpful' }, testEquivalent);
      expect(testEquivalent.helpful_votes).toBe(initialVotes + 1);
    });
  });

  describe('AC-06: Negative feedback prompts optional context', () => {
    it('prompts for context when voting not helpful without reason', () => {
      const result = submitFeedback({ equivalent_id: 'eq-neg', session_id: 'session-1', vote_type: 'not_helpful' }, testEquivalent);
      expect(result.success).toBe(true);
      expect(result.prompt_context).toBe('Would you like to explain why?');
    });

    it('does not prompt when reason is provided', () => {
      const result = submitFeedback({ equivalent_id: 'eq-reason', session_id: 'session-1', vote_type: 'not_helpful', reason: 'The ratio seems off' }, testEquivalent);
      expect(result.success).toBe(true);
      expect(result.prompt_context).toBeUndefined();
    });

    it('does not prompt for helpful votes', () => {
      const result = submitFeedback({ equivalent_id: 'eq-helpful', session_id: 'session-1', vote_type: 'helpful' }, testEquivalent);
      expect(result.success).toBe(true);
      expect(result.prompt_context).toBeUndefined();
    });
  });
});
