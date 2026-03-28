import { useTranslation } from '../i18n';
import type { AiSuggestion } from '../types';

interface AiSuggestionsSectionProps {
  suggestions: AiSuggestion[];
  savingIndex: number | null;
  savedIndexes: Set<number>;
  onSave: (suggestion: AiSuggestion) => void;
}

export function AiSuggestionsSection({
  suggestions,
  savingIndex,
  savedIndexes,
  onSave,
}: AiSuggestionsSectionProps) {
  const { t } = useTranslation();

  if (suggestions.length === 0) return null;

  return (
    <div className="ai-suggestions-section">
      <p className="ai-disclaimer">{t('search.aiDisclaimer')}</p>
      <div className="results-grid">
        {suggestions.map((suggestion, index) => (
          <article key={index} className="result-card ai-suggestion-card">
            <div className="result-main">
              <div>
                <h3>{suggestion.displayFormat}</h3>
                {suggestion.bananaDisplayFormat ? (
                  <p className="banana-display">{suggestion.bananaDisplayFormat}</p>
                ) : null}
              </div>
              <span className="source-badge source-ai_suggested">{t('search.sourceAi')}</span>
            </div>
            {savedIndexes.has(index) ? (
              <span className="saved-badge">{t('search.savedAi')}</span>
            ) : (
              <button
                type="button"
                className="secondary-button"
                disabled={savingIndex === index}
                onClick={() => onSave(suggestion)}
              >
                {savingIndex === index ? '...' : t('search.saveAi')}
              </button>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
