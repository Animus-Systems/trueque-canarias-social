import { describe, it, expect } from 'vitest';
import { levenshteinDistance } from '../server/db/repository';
import { formatUnitValue, formatEquivalentI18n, formatBananaDisplayI18n } from '../server/i18n';

describe('formatUnitValue', () => {
  it('returns singular for exactly 1', () => {
    expect(formatUnitValue(1, 'hour', 'en')).toBe('1 hour');
    expect(formatUnitValue(1, 'hour', 'es')).toBe('1 hora');
  });

  it('returns plural for values other than 1', () => {
    expect(formatUnitValue(2, 'hour', 'en')).toBe('2 hours');
    expect(formatUnitValue(0.5, 'hour', 'en')).toBe('0.5 hours');
    expect(formatUnitValue(2, 'hour', 'es')).toBe('2 horas');
  });

  it('handles kg (same in both languages)', () => {
    expect(formatUnitValue(3, 'kg', 'en')).toBe('3 kg');
    expect(formatUnitValue(3, 'kg', 'es')).toBe('3 kg');
  });

  it('handles unit/unidad', () => {
    expect(formatUnitValue(1, 'unit', 'en')).toBe('1 unit');
    expect(formatUnitValue(2, 'unit', 'es')).toBe('2 unidades');
  });
});

describe('formatEquivalentI18n', () => {
  it('formats service-to-service (defaults to hour)', () => {
    expect(formatEquivalentI18n('guitar lessons', 'gardening', 2, 'en')).toBe(
      '1 hour guitar lessons \u2248 2 hours gardening'
    );
  });

  it('formats in Spanish', () => {
    expect(formatEquivalentI18n('clases de guitarra', 'jardinería', 2, 'es')).toBe(
      '1 hora clases de guitarra \u2248 2 horas jardinería'
    );
  });

  it('formats mixed units (service for goods)', () => {
    expect(formatEquivalentI18n('guitar lessons', 'potatoes', 3, 'en', 'hour', 'kg')).toBe(
      '1 hour guitar lessons \u2248 3 kg potatoes'
    );
  });

  it('formats goods-to-goods', () => {
    expect(formatEquivalentI18n('peaches', 'lemons', 1.5, 'en', 'kg', 'kg')).toBe(
      '1 kg peaches \u2248 1.5 kg lemons'
    );
  });
});

describe('formatBananaDisplayI18n', () => {
  it('formats in English', () => {
    expect(formatBananaDisplayI18n(3, 'en')).toBe('\u{1F34C} \u2248 3 kg Canarian bananas');
  });

  it('formats in Spanish', () => {
    expect(formatBananaDisplayI18n(3, 'es')).toBe('\u{1F34C} \u2248 3 kg plátanos canarios');
  });

  it('returns null for null input', () => {
    expect(formatBananaDisplayI18n(null, 'en')).toBeNull();
  });
});

describe('levenshteinDistance', () => {
  it('returns 0 for identical strings', () => {
    expect(levenshteinDistance('abc', 'abc')).toBe(0);
  });

  it('returns the length of the other string when one is empty', () => {
    expect(levenshteinDistance('', 'abc')).toBe(3);
    expect(levenshteinDistance('abc', '')).toBe(3);
  });

  it('returns 0 for two empty strings', () => {
    expect(levenshteinDistance('', '')).toBe(0);
  });

  it('calculates single-character edit distances', () => {
    expect(levenshteinDistance('cat', 'hat')).toBe(1);
    expect(levenshteinDistance('cat', 'cats')).toBe(1);
    expect(levenshteinDistance('cat', 'at')).toBe(1);
  });

  it('calculates multi-character edit distances', () => {
    expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
    expect(levenshteinDistance('guitar', 'guitr')).toBe(1);
  });

  it('is used for duplicate detection with threshold < 3', () => {
    expect(levenshteinDistance('cooking', 'cookin')).toBeLessThan(3);
    expect(levenshteinDistance('cooking', 'baking')).toBeGreaterThanOrEqual(3);
  });
});
