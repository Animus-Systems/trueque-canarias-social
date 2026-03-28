import { describe, it, expect } from 'vitest';

type Status = 'pending' | 'approved' | 'rejected';
type Action = 'approve' | 'reject';

interface Equivalent {
  id: string;
  status: Status;
  rejectionReason: string | null;
  moderatedBy: string | null;
  moderatedAt: string | null;
  createdBySession: string;
}

interface ModerationLogEntry {
  equivalentId: string;
  action: string;
  previousStatus: Status;
  newStatus: Status;
  performedBy: string;
  reason: string | null;
}

interface ModerationResult {
  success: boolean;
  message: string;
}

const moderationLog: ModerationLogEntry[] = [];
const reputations: Record<string, number> = {};

function moderateEquivalent(
  equivalent: Equivalent,
  moderatorSessionId: string,
  action: Action,
  reason?: string,
  isModerator = true
): ModerationResult {
  if (!isModerator) {
    return { success: false, message: 'Moderator access required.' };
  }

  const previousStatus = equivalent.status;
  const newStatus = action === 'approve' ? 'approved' : 'rejected';

  if (previousStatus === newStatus) {
    return { success: false, message: `Equivalent is already ${newStatus}` };
  }

  if (action === 'reject' && !reason) {
    return { success: false, message: 'Rejection reason is required' };
  }

  equivalent.status = newStatus;
  equivalent.moderatedBy = moderatorSessionId;
  equivalent.moderatedAt = new Date().toISOString();
  equivalent.rejectionReason = action === 'reject' ? (reason ?? null) : null;

  moderationLog.push({
    equivalentId: equivalent.id,
    action: newStatus,
    previousStatus,
    newStatus,
    performedBy: moderatorSessionId,
    reason: reason ?? null,
  });

  if (action === 'approve') {
    reputations[equivalent.createdBySession] =
      (reputations[equivalent.createdBySession] ?? 0) + 1;
  }

  return { success: true, message: `Equivalent ${newStatus} successfully.` };
}

function createEquivalent(overrides: Partial<Equivalent> = {}): Equivalent {
  return {
    id: 'eq-1',
    status: 'pending',
    rejectionReason: null,
    moderatedBy: null,
    moderatedAt: null,
    createdBySession: 'contributor-1',
    ...overrides,
  };
}

describe('Moderation workflow', () => {
  it('approves a pending equivalent', () => {
    const eq = createEquivalent();
    const result = moderateEquivalent(eq, 'mod-1', 'approve');

    expect(result.success).toBe(true);
    expect(eq.status).toBe('approved');
    expect(eq.moderatedBy).toBe('mod-1');
    expect(eq.moderatedAt).toBeTruthy();
  });

  it('rejects a pending equivalent with reason', () => {
    const eq = createEquivalent();
    const result = moderateEquivalent(eq, 'mod-1', 'reject', 'inaccurate_ratio');

    expect(result.success).toBe(true);
    expect(eq.status).toBe('rejected');
    expect(eq.rejectionReason).toBe('inaccurate_ratio');
  });

  it('prevents rejecting without a reason', () => {
    const eq = createEquivalent();
    const result = moderateEquivalent(eq, 'mod-1', 'reject');

    expect(result.success).toBe(false);
    expect(result.message).toContain('reason');
    expect(eq.status).toBe('pending');
  });

  it('prevents double-approving', () => {
    const eq = createEquivalent({ status: 'approved' });
    const result = moderateEquivalent(eq, 'mod-1', 'approve');

    expect(result.success).toBe(false);
    expect(result.message).toContain('already approved');
  });

  it('prevents double-rejecting', () => {
    const eq = createEquivalent({ status: 'rejected' });
    const result = moderateEquivalent(eq, 'mod-1', 'reject', 'duplicate');

    expect(result.success).toBe(false);
    expect(result.message).toContain('already rejected');
  });

  it('allows re-approving a rejected equivalent', () => {
    const eq = createEquivalent({ status: 'rejected', rejectionReason: 'duplicate' });
    const result = moderateEquivalent(eq, 'mod-1', 'approve');

    expect(result.success).toBe(true);
    expect(eq.status).toBe('approved');
    expect(eq.rejectionReason).toBeNull();
  });

  it('records actions in the moderation log', () => {
    const initialLogLength = moderationLog.length;
    const eq = createEquivalent({ id: 'eq-log-test' });
    moderateEquivalent(eq, 'mod-1', 'approve');

    const entry = moderationLog[moderationLog.length - 1];
    expect(moderationLog.length).toBeGreaterThan(initialLogLength);
    expect(entry.equivalentId).toBe('eq-log-test');
    expect(entry.action).toBe('approved');
    expect(entry.previousStatus).toBe('pending');
    expect(entry.newStatus).toBe('approved');
    expect(entry.performedBy).toBe('mod-1');
  });

  it('increments contributor reputation on approval', () => {
    const eq = createEquivalent({ id: 'eq-rep', createdBySession: 'new-contributor' });
    const before = reputations['new-contributor'] ?? 0;
    moderateEquivalent(eq, 'mod-1', 'approve');

    expect(reputations['new-contributor']).toBe(before + 1);
  });

  it('does not increment reputation on rejection', () => {
    const eq = createEquivalent({ id: 'eq-norep', createdBySession: 'rejected-user' });
    const before = reputations['rejected-user'] ?? 0;
    moderateEquivalent(eq, 'mod-1', 'reject', 'inappropriate');

    expect(reputations['rejected-user'] ?? 0).toBe(before);
  });

  it('denies access to non-moderators', () => {
    const eq = createEquivalent();
    const result = moderateEquivalent(eq, 'random-user', 'approve', undefined, false);

    expect(result.success).toBe(false);
    expect(result.message).toContain('Moderator access required');
    expect(eq.status).toBe('pending');
  });
});
