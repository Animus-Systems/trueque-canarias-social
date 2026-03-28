import { describe, it, expect } from 'vitest';

interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

function isRateLimited(actionCount: number, config: RateLimitConfig): boolean {
  return actionCount >= config.limit;
}

const submissionLimit: RateLimitConfig = { limit: 10, windowMs: 86400000 };
const voteLimit: RateLimitConfig = { limit: 50, windowMs: 3600000 };
const flagLimit: RateLimitConfig = { limit: 5, windowMs: 3600000 };

describe('Rate limiting - Submissions', () => {
  it('allows submissions under the daily limit', () => {
    expect(isRateLimited(0, submissionLimit)).toBe(false);
    expect(isRateLimited(5, submissionLimit)).toBe(false);
    expect(isRateLimited(9, submissionLimit)).toBe(false);
  });

  it('blocks at 10 submissions per day', () => {
    expect(isRateLimited(10, submissionLimit)).toBe(true);
  });

  it('blocks above the limit', () => {
    expect(isRateLimited(15, submissionLimit)).toBe(true);
  });

  it('uses a 24-hour window', () => {
    expect(submissionLimit.windowMs).toBe(86400000);
  });
});

describe('Rate limiting - Votes', () => {
  it('allows votes under the hourly limit', () => {
    expect(isRateLimited(0, voteLimit)).toBe(false);
    expect(isRateLimited(25, voteLimit)).toBe(false);
    expect(isRateLimited(49, voteLimit)).toBe(false);
  });

  it('blocks at 50 votes per hour', () => {
    expect(isRateLimited(50, voteLimit)).toBe(true);
  });

  it('uses a 1-hour window', () => {
    expect(voteLimit.windowMs).toBe(3600000);
  });
});

describe('Rate limiting - Flags', () => {
  it('allows flags under the hourly limit', () => {
    expect(isRateLimited(0, flagLimit)).toBe(false);
    expect(isRateLimited(4, flagLimit)).toBe(false);
  });

  it('blocks at 5 flags per hour', () => {
    expect(isRateLimited(5, flagLimit)).toBe(true);
  });

  it('uses a 1-hour window', () => {
    expect(flagLimit.windowMs).toBe(3600000);
  });
});
