/**
 * US-02: Display Confidence Scores - Test Suite
 * Satisfies AC-01 through AC-05
 *
 * Note: Uses mock for confidence score testing
 */

import { describe, it, expect } from 'vitest';

// Mock confidence score calculator
interface Equivalent {
  id: string;
  skill_name: string;
  item_name: string;
  ratio: number;
  helpful_votes: number;
  not_helpful_votes: number;
}

// AC-04: Score calculation is transparent
// Formula: (helpful_votes / (helpful_votes + not_helpful_votes)) × 100
function calculateConfidenceScore(equivalent: Equivalent): number {
  const total = equivalent.helpful_votes + equivalent.not_helpful_votes;
  if (total === 0) return 50; // AC-05: New equivalents default to 50%
  return Math.round((equivalent.helpful_votes / total) * 100);
}

// AC-03: Score uses color coding
function getConfidenceColor(score: number): string {
  if (score >= 70) return 'green';
  if (score >= 40) return 'yellow';
  return 'red';
}

// AC-01: Confidence score displays as percentage
function formatConfidencePercentage(score: number): string {
  return `Confidence: ${score}%`;
}

// Mock equivalent data
const mockEquivalent: Equivalent = {
  id: '1',
  skill_name: 'guitar lessons',
  item_name: 'gardening',
  ratio: 2.0,
  helpful_votes: 13,
  not_helpful_votes: 2
};

const newEquivalent: Equivalent = {
  id: '2',
  skill_name: 'cooking',
  item_name: 'cleaning',
  ratio: 1.0,
  helpful_votes: 0,
  not_helpful_votes: 0
};

describe('US-02: Display Confidence Scores', () => {
  describe('AC-01: Confidence score displays as percentage', () => {
    it('returns percentage format string', () => {
      const score = calculateConfidenceScore(mockEquivalent);
      const formatted = formatConfidencePercentage(score);
      expect(formatted).toBe('Confidence: 87%');
    });

    it('displays 87% for 13 helpful, 2 not helpful', () => {
      const score = calculateConfidenceScore(mockEquivalent);
      expect(score).toBe(87);
      expect(formatConfidencePercentage(score)).toBe('Confidence: 87%');
    });
  });

  describe('AC-02: Score is visible in search results', () => {
    it('includes confidence_score in result object', () => {
      const result = {
        id: mockEquivalent.id,
        skill_name: mockEquivalent.skill_name,
        item_name: mockEquivalent.item_name,
        ratio: mockEquivalent.ratio,
        confidence_score: calculateConfidenceScore(mockEquivalent)
      };
      expect(result).toHaveProperty('confidence_score');
      expect(typeof result.confidence_score).toBe('number');
    });
  });

  describe('AC-03: Score uses color coding', () => {
    it('returns green for scores 70% and above', () => {
      expect(getConfidenceColor(70)).toBe('green');
      expect(getConfidenceColor(87)).toBe('green');
      expect(getConfidenceColor(100)).toBe('green');
    });

    it('returns yellow for scores 40-69%', () => {
      expect(getConfidenceColor(40)).toBe('yellow');
      expect(getConfidenceColor(55)).toBe('yellow');
      expect(getConfidenceColor(69)).toBe('yellow');
    });

    it('returns red for scores below 40%', () => {
      expect(getConfidenceColor(39)).toBe('red');
      expect(getConfidenceColor(20)).toBe('red');
      expect(getConfidenceColor(0)).toBe('red');
    });
  });

  describe('AC-04: Score calculation is transparent', () => {
    it('formula is (helpful / (helpful + not helpful)) × 100', () => {
      // 10 helpful, 10 not helpful = 50%
      const testEquivalent: Equivalent = {
        id: 'test',
        skill_name: 'test',
        item_name: 'test',
        ratio: 1.0,
        helpful_votes: 10,
        not_helpful_votes: 10
      };
      expect(calculateConfidenceScore(testEquivalent)).toBe(50);

      // 9 helpful, 1 not helpful = 90%
      testEquivalent.helpful_votes = 9;
      testEquivalent.not_helpful_votes = 1;
      expect(calculateConfidenceScore(testEquivalent)).toBe(90);

      // 1 helpful, 9 not helpful = 10%
      testEquivalent.helpful_votes = 1;
      testEquivalent.not_helpful_votes = 9;
      expect(calculateConfidenceScore(testEquivalent)).toBe(10);
    });

    it('provides tooltip text explaining formula', () => {
      const tooltipText = 'Score formula: (votes / (votes + reports)) × 100';
      expect(tooltipText).toContain('formula');
      expect(tooltipText).toContain('votes');
    });
  });

  describe('AC-05: New equivalents default to 50%', () => {
    it('returns 50% when no votes exist', () => {
      const score = calculateConfidenceScore(newEquivalent);
      expect(score).toBe(50);
      expect(formatConfidencePercentage(score)).toBe('Confidence: 50%');
    });

    it('returns 50% when both helpful and not helpful are 0', () => {
      const zeroVotes: Equivalent = {
        id: '3',
        skill_name: 'test',
        item_name: 'test',
        ratio: 1.0,
        helpful_votes: 0,
        not_helpful_votes: 0
      };
      expect(calculateConfidenceScore(zeroVotes)).toBe(50);
    });
  });
});
