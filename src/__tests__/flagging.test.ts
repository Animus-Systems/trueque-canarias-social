import { describe, it, expect } from 'vitest';

const AUTO_REJECT_THRESHOLD = 3;

interface FlagState {
  flaggedCount: number;
  status: 'pending' | 'approved' | 'rejected';
  flaggedBy: Set<string>;
}

interface FlagResult {
  success: boolean;
  message: string;
  autoRejected: boolean;
}

function flagEquivalent(
  state: FlagState,
  sessionId: string,
  reason: string
): FlagResult {
  if (state.flaggedBy.has(sessionId)) {
    return { success: false, message: 'You have already flagged this equivalent', autoRejected: false };
  }

  if (reason.length < 5) {
    return { success: false, message: 'Reason must be at least 5 characters', autoRejected: false };
  }

  state.flaggedBy.add(sessionId);
  state.flaggedCount += 1;

  if (state.flaggedCount >= AUTO_REJECT_THRESHOLD && state.status !== 'rejected') {
    state.status = 'rejected';
    return {
      success: true,
      message: 'This equivalent has been flagged and automatically removed for review.',
      autoRejected: true,
    };
  }

  return {
    success: true,
    message: 'Thank you for your feedback. This equivalent has been flagged for review.',
    autoRejected: false,
  };
}

function createFlagState(): FlagState {
  return { flaggedCount: 0, status: 'approved', flaggedBy: new Set() };
}

describe('Flagging equivalents', () => {
  it('allows a session to flag an equivalent', () => {
    const state = createFlagState();
    const result = flagEquivalent(state, 'session-1', 'Ratio seems incorrect');

    expect(result.success).toBe(true);
    expect(result.autoRejected).toBe(false);
    expect(state.flaggedCount).toBe(1);
  });

  it('prevents duplicate flags from the same session', () => {
    const state = createFlagState();
    flagEquivalent(state, 'session-1', 'Ratio seems incorrect');
    const duplicate = flagEquivalent(state, 'session-1', 'Still wrong');

    expect(duplicate.success).toBe(false);
    expect(duplicate.message).toContain('already flagged');
    expect(state.flaggedCount).toBe(1);
  });

  it('requires a reason of at least 5 characters', () => {
    const state = createFlagState();
    const result = flagEquivalent(state, 'session-1', 'bad');

    expect(result.success).toBe(false);
    expect(result.message).toContain('at least 5');
  });

  it('auto-rejects at 3 flags from different sessions', () => {
    const state = createFlagState();
    flagEquivalent(state, 'session-1', 'Incorrect ratio');
    flagEquivalent(state, 'session-2', 'This is wrong');
    const third = flagEquivalent(state, 'session-3', 'Not accurate');

    expect(third.success).toBe(true);
    expect(third.autoRejected).toBe(true);
    expect(state.status).toBe('rejected');
    expect(state.flaggedCount).toBe(3);
  });

  it('does not auto-reject if already rejected', () => {
    const state: FlagState = { flaggedCount: 2, status: 'rejected', flaggedBy: new Set(['a', 'b']) };
    const result = flagEquivalent(state, 'session-3', 'Also wrong');

    expect(result.success).toBe(true);
    expect(result.autoRejected).toBe(false);
  });

  it('allows flags from multiple different sessions', () => {
    const state = createFlagState();
    const r1 = flagEquivalent(state, 'session-1', 'Reason one here');
    const r2 = flagEquivalent(state, 'session-2', 'Reason two here');

    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
    expect(state.flaggedCount).toBe(2);
    expect(r2.autoRejected).toBe(false);
  });
});
