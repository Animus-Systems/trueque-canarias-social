import { describe, it, expect } from 'vitest';

interface SessionProfile {
  reputation: number;
  totalSubmissions: number;
  recentSubmissions: number;
  recentFlags: number;
}

interface AnomalyResult {
  flagged: boolean;
  reason: string | null;
}

function detectAnomalies(profile: SessionProfile): AnomalyResult {
  if (profile.reputation === 0 && profile.recentSubmissions >= 5) {
    return {
      flagged: true,
      reason: 'High volume from low-reputation session',
    };
  }

  if (profile.recentFlags >= 3) {
    return {
      flagged: true,
      reason: 'Frequent flagging activity',
    };
  }

  return { flagged: false, reason: null };
}

describe('Anomaly detection', () => {
  it('flags high-volume submissions from zero-reputation sessions', () => {
    const result = detectAnomalies({
      reputation: 0,
      totalSubmissions: 8,
      recentSubmissions: 5,
      recentFlags: 0,
    });

    expect(result.flagged).toBe(true);
    expect(result.reason).toContain('low-reputation');
  });

  it('does not flag sessions with established reputation', () => {
    const result = detectAnomalies({
      reputation: 5,
      totalSubmissions: 10,
      recentSubmissions: 8,
      recentFlags: 0,
    });

    expect(result.flagged).toBe(false);
  });

  it('does not flag low-volume zero-reputation sessions', () => {
    const result = detectAnomalies({
      reputation: 0,
      totalSubmissions: 2,
      recentSubmissions: 2,
      recentFlags: 0,
    });

    expect(result.flagged).toBe(false);
  });

  it('flags sessions with high flagging activity', () => {
    const result = detectAnomalies({
      reputation: 10,
      totalSubmissions: 0,
      recentSubmissions: 0,
      recentFlags: 3,
    });

    expect(result.flagged).toBe(true);
    expect(result.reason).toContain('flagging');
  });

  it('does not flag normal flagging activity', () => {
    const result = detectAnomalies({
      reputation: 3,
      totalSubmissions: 5,
      recentSubmissions: 1,
      recentFlags: 1,
    });

    expect(result.flagged).toBe(false);
  });

  it('detects the boundary case at exactly 5 submissions', () => {
    const below = detectAnomalies({
      reputation: 0,
      totalSubmissions: 4,
      recentSubmissions: 4,
      recentFlags: 0,
    });

    const at = detectAnomalies({
      reputation: 0,
      totalSubmissions: 5,
      recentSubmissions: 5,
      recentFlags: 0,
    });

    expect(below.flagged).toBe(false);
    expect(at.flagged).toBe(true);
  });
});
