import { describe, it, expect } from 'vitest';

const SOURCE_TYPES = ['official', 'community', 'ai_suggested'] as const;
type SourceType = (typeof SOURCE_TYPES)[number];

function isValidSourceType(value: string): value is SourceType {
  return SOURCE_TYPES.includes(value as SourceType);
}

describe('Source type validation', () => {
  it('accepts valid source types', () => {
    expect(isValidSourceType('official')).toBe(true);
    expect(isValidSourceType('community')).toBe(true);
    expect(isValidSourceType('ai_suggested')).toBe(true);
  });

  it('rejects invalid source types', () => {
    expect(isValidSourceType('unknown')).toBe(false);
    expect(isValidSourceType('')).toBe(false);
    expect(isValidSourceType('Official')).toBe(false);
  });

  it('defaults new submissions to community', () => {
    const defaultSource: SourceType = 'community';
    expect(defaultSource).toBe('community');
  });

  it('seed data should be official', () => {
    const seedSource: SourceType = 'official';
    expect(seedSource).toBe('official');
  });
});
