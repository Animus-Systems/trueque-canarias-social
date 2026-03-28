import { describe, it, expect } from 'vitest';
import { translations, SUPPORTED_LANGUAGES } from '../../client/src/i18n/translations';

describe('i18n translations', () => {
  it('has translations for all supported languages', () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      expect(translations[lang]).toBeDefined();
      expect(Object.keys(translations[lang]).length).toBeGreaterThan(0);
    }
  });

  it('en and es have identical key sets', () => {
    const enKeys = Object.keys(translations.en).sort();
    const esKeys = Object.keys(translations.es).sort();
    expect(enKeys).toEqual(esKeys);
  });

  it('no translation value is empty', () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      for (const [key, value] of Object.entries(translations[lang])) {
        expect(value.trim().length, `${lang}.${key} is empty`).toBeGreaterThan(0);
      }
    }
  });

  it('no translation value equals the key itself', () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      for (const [key, value] of Object.entries(translations[lang])) {
        expect(value, `${lang}.${key} equals its own key`).not.toBe(key);
      }
    }
  });

  it('en and es translations differ for non-shared keys', () => {
    const sharedKeys = ['app.eyebrow'];
    let differCount = 0;
    for (const key of Object.keys(translations.en)) {
      if (sharedKeys.includes(key)) continue;
      if (translations.en[key] !== translations.es[key]) {
        differCount++;
      }
    }
    expect(differCount).toBeGreaterThan(0);
  });
});
