import { describe, it, expect } from 'vitest';

interface ImportEntry {
  skillNameEn: string;
  skillNameEs: string;
  itemNameEn: string;
  itemNameEs: string;
  ratio: number;
  bananaValue?: number | null;
  descriptionEn: string;
  descriptionEs: string;
  sourceAttribution?: string;
}

function validateImportEntry(entry: unknown): entry is ImportEntry {
  if (typeof entry !== 'object' || entry === null) return false;
  const obj = entry as Record<string, unknown>;
  return (
    typeof obj.skillNameEn === 'string' && obj.skillNameEn.length > 0 &&
    typeof obj.skillNameEs === 'string' && obj.skillNameEs.length > 0 &&
    typeof obj.itemNameEn === 'string' && obj.itemNameEn.length > 0 &&
    typeof obj.itemNameEs === 'string' && obj.itemNameEs.length > 0 &&
    typeof obj.ratio === 'number' && obj.ratio > 0 && obj.ratio <= 9999 &&
    typeof obj.descriptionEn === 'string' && obj.descriptionEn.length > 0 &&
    typeof obj.descriptionEs === 'string' && obj.descriptionEs.length > 0
  );
}

function validateImportBatch(entries: unknown[]): { valid: ImportEntry[]; invalid: number } {
  const valid: ImportEntry[] = [];
  let invalid = 0;
  for (const entry of entries) {
    if (validateImportEntry(entry)) {
      valid.push(entry);
    } else {
      invalid += 1;
    }
  }
  return { valid, invalid };
}

describe('Bulk import validation', () => {
  it('accepts a valid entry', () => {
    const entry: ImportEntry = {
      skillNameEn: 'guitar lessons',
      skillNameEs: 'clases de guitarra',
      itemNameEn: 'gardening',
      itemNameEs: 'jardinería',
      ratio: 2,
      descriptionEn: 'A fair exchange',
      descriptionEs: 'Un intercambio justo',
    };
    expect(validateImportEntry(entry)).toBe(true);
  });

  it('rejects entry with missing fields', () => {
    expect(validateImportEntry({ skillNameEn: 'test' })).toBe(false);
    expect(validateImportEntry({})).toBe(false);
  });

  it('rejects entry with empty strings', () => {
    expect(validateImportEntry({
      skillNameEn: '', skillNameEs: 'b', itemNameEn: 'c', itemNameEs: 'd',
      ratio: 1, descriptionEn: 'e', descriptionEs: 'f',
    })).toBe(false);
  });

  it('rejects entry with invalid ratio', () => {
    expect(validateImportEntry({
      skillNameEn: 'a', skillNameEs: 'b', itemNameEn: 'c', itemNameEs: 'd',
      ratio: 0, descriptionEn: 'e', descriptionEs: 'f',
    })).toBe(false);
    expect(validateImportEntry({
      skillNameEn: 'a', skillNameEs: 'b', itemNameEn: 'c', itemNameEs: 'd',
      ratio: 10000, descriptionEn: 'e', descriptionEs: 'f',
    })).toBe(false);
  });

  it('validates a batch and reports counts', () => {
    const batch = [
      { skillNameEn: 'a', skillNameEs: 'b', itemNameEn: 'c', itemNameEs: 'd', ratio: 1, descriptionEn: 'e', descriptionEs: 'f' },
      { skillNameEn: '', skillNameEs: 'b', itemNameEn: 'c', itemNameEs: 'd', ratio: 1, descriptionEn: 'e', descriptionEs: 'f' },
      { skillNameEn: 'a', skillNameEs: 'b', itemNameEn: 'c', itemNameEs: 'd', ratio: 2, descriptionEn: 'e', descriptionEs: 'f' },
    ];
    const result = validateImportBatch(batch);
    expect(result.valid.length).toBe(2);
    expect(result.invalid).toBe(1);
  });

  it('enforces max 100 entries', () => {
    const maxBatch = 100;
    const entries = Array.from({ length: 101 }, (_, i) => ({
      skillNameEn: `skill${i}`, skillNameEs: `habilidad${i}`,
      itemNameEn: `item${i}`, itemNameEs: `artículo${i}`,
      ratio: 1, descriptionEn: `desc${i}`, descriptionEs: `desc${i}`,
    }));
    expect(entries.length).toBeGreaterThan(maxBatch);
  });
});
