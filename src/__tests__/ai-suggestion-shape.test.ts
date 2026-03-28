import { describe, it, expect } from 'vitest';

interface AiSuggestion {
  skillNameEn: string;
  skillNameEs: string;
  itemNameEn: string;
  itemNameEs: string;
  ratio: number;
  bananaValue: number | null;
  descriptionEn: string;
  descriptionEs: string;
  displayFormat: string;
  bananaDisplayFormat: string | null;
}

function isValidAiSuggestion(value: unknown): value is AiSuggestion {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.skillNameEn === 'string' &&
    typeof obj.skillNameEs === 'string' &&
    typeof obj.itemNameEn === 'string' &&
    typeof obj.itemNameEs === 'string' &&
    typeof obj.ratio === 'number' &&
    obj.ratio > 0 &&
    (obj.bananaValue === null || typeof obj.bananaValue === 'number') &&
    typeof obj.descriptionEn === 'string' &&
    typeof obj.descriptionEs === 'string' &&
    typeof obj.displayFormat === 'string'
  );
}

describe('AI suggestion shape', () => {
  it('validates a complete suggestion', () => {
    const suggestion: AiSuggestion = {
      skillNameEn: 'guitar lessons',
      skillNameEs: 'clases de guitarra',
      itemNameEn: 'gardening',
      itemNameEs: 'jardinería',
      ratio: 2,
      bananaValue: 3,
      descriptionEn: 'A fair exchange',
      descriptionEs: 'Un intercambio justo',
      displayFormat: '1 hour guitar lessons ≈ 2 hours gardening',
      bananaDisplayFormat: '🍌 ≈ 3 kg Canarian bananas',
    };
    expect(isValidAiSuggestion(suggestion)).toBe(true);
  });

  it('accepts null banana value', () => {
    const suggestion: AiSuggestion = {
      skillNameEn: 'coding',
      skillNameEs: 'programación',
      itemNameEn: 'design',
      itemNameEs: 'diseño',
      ratio: 1,
      bananaValue: null,
      descriptionEn: 'Equal exchange',
      descriptionEs: 'Intercambio igual',
      displayFormat: '1 hour coding ≈ 1 hour design',
      bananaDisplayFormat: null,
    };
    expect(isValidAiSuggestion(suggestion)).toBe(true);
  });

  it('rejects missing required fields', () => {
    expect(isValidAiSuggestion({})).toBe(false);
    expect(isValidAiSuggestion({ skillNameEn: 'test' })).toBe(false);
    expect(isValidAiSuggestion(null)).toBe(false);
    expect(isValidAiSuggestion('string')).toBe(false);
  });

  it('rejects zero or negative ratio', () => {
    expect(isValidAiSuggestion({
      skillNameEn: 'a', skillNameEs: 'b', itemNameEn: 'c', itemNameEs: 'd',
      ratio: 0, bananaValue: null, descriptionEn: 'e', descriptionEs: 'f', displayFormat: 'g',
    })).toBe(false);
    expect(isValidAiSuggestion({
      skillNameEn: 'a', skillNameEs: 'b', itemNameEn: 'c', itemNameEs: 'd',
      ratio: -1, bananaValue: null, descriptionEn: 'e', descriptionEs: 'f', displayFormat: 'g',
    })).toBe(false);
  });
});
