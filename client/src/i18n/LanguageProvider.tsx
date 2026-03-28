import { useEffect } from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';
import { setApiLanguage } from '../api';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, type Language } from './translations';

export function LanguageProvider() {
  const { lang } = useParams<{ lang: string }>();

  const isValid = lang && SUPPORTED_LANGUAGES.includes(lang as Language);

  useEffect(() => {
    if (isValid) {
      document.documentElement.lang = lang;
      setApiLanguage(lang);
    }
  }, [lang, isValid]);

  if (!isValid) {
    return <Navigate to={`/${DEFAULT_LANGUAGE}`} replace />;
  }

  return <Outlet />;
}
