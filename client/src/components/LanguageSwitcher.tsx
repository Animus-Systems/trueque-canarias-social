import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n';
import { setApiLanguage } from '../api';

export function LanguageSwitcher() {
  const lang = useLanguage();
  const navigate = useNavigate();

  const next = lang === 'es' ? 'en' : 'es';

  function handleSwitch() {
    setApiLanguage(next);
    document.documentElement.lang = next;
    navigate(`/${next}`, { replace: true });
  }

  return (
    <button
      type="button"
      className="lang-switch"
      aria-label={`Switch to ${next === 'en' ? 'English' : 'Espa\u00f1ol'}`}
      onClick={handleSwitch}
    >
      {next.toUpperCase()}
    </button>
  );
}
