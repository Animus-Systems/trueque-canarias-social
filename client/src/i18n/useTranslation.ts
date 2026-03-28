import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { translations, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, type Language } from './translations';

export function useLanguage(): Language {
  const { lang } = useParams<{ lang: string }>();
  if (lang && SUPPORTED_LANGUAGES.includes(lang as Language)) {
    return lang as Language;
  }
  return DEFAULT_LANGUAGE;
}

export function useTranslation() {
  const lang = useLanguage();
  const dict = translations[lang];

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let value = dict[key] ?? translations[DEFAULT_LANGUAGE][key] ?? key;
      if (params) {
        for (const [placeholder, replacement] of Object.entries(params)) {
          value = value.replace(`{${placeholder}}`, String(replacement));
        }
      }
      return value;
    },
    [dict]
  );

  return { t, lang };
}
