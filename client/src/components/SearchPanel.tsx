import { useTranslation } from '../i18n';
import type { AiSuggestion, SearchItem } from '../types';
import { AiSuggestionsSection } from './AiSuggestionsSection';
import { ResultCard } from './ResultCard';

interface SearchPanelProps {
  query: string;
  isSearching: boolean;
  items: SearchItem[];
  aiSuggestions: AiSuggestion[];
  message: string | null;
  votingId: string | null;
  reasonPromptId: string | null;
  reasonText: string;
  flaggingId: string | null;
  flagReasonText: string;
  savingAiIndex: number | null;
  savedAiIndexes: Set<number>;
  aiLoading: boolean;
  aiCountdown: number;
  page: number;
  totalPages: number;
  total: number;
  onQueryChange: (query: string) => void;
  onSearch: (query: string) => void;
  onPageChange: (page: number) => void;
  onVote: (equivalentId: string, voteType: 'helpful' | 'not_helpful', reason?: string) => void;
  onReasonChange: (text: string) => void;
  onReasonSubmit: (equivalentId: string) => void;
  onReasonDismiss: () => void;
  onFlagStart: (equivalentId: string) => void;
  onFlagSubmit: (equivalentId: string, reason: string) => void;
  onFlagReasonChange: (text: string) => void;
  onFlagDismiss: () => void;
  onSaveAiSuggestion: (suggestion: AiSuggestion) => void;
}

const presets: Array<{ en: string; es: string }> = [
  { en: 'guitar lessons', es: 'clases de guitarra' },
  { en: 'cooking', es: 'cocina' },
  { en: 'web design', es: 'diseño web' },
  { en: '5 kg potatoes for eggs', es: '5 kg patatas por huevos' },
  { en: 'plumbing', es: 'fontanería' },
  { en: 'used laptop', es: 'portátil usado' },
];

export function SearchPanel({
  query, isSearching, items, aiSuggestions, message,
  votingId, reasonPromptId, reasonText, flaggingId, flagReasonText,
  savingAiIndex, savedAiIndexes,
  aiLoading, aiCountdown,
  page, totalPages, total,
  onQueryChange, onSearch, onPageChange, onVote,
  onReasonChange, onReasonSubmit, onReasonDismiss,
  onFlagStart, onFlagSubmit, onFlagReasonChange, onFlagDismiss,
  onSaveAiSuggestion,
}: SearchPanelProps) {
  const { t, lang } = useTranslation();
  const hasSearched = message !== null || items.length > 0;

  return (
    <section className="panel panel-elevated">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{t('search.eyebrow')}</p>
          <h2>{t('search.heading')}</h2>
        </div>
        <p className="panel-copy">{t('search.copy')}</p>
      </div>

      <form
        className="search-form"
        onSubmit={(e) => { e.preventDefault(); onSearch(query); }}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={t('search.placeholder')}
          aria-label={t('search.eyebrow')}
        />
        <button type="submit" disabled={isSearching} aria-busy={isSearching}>
          {isSearching ? t('search.searching') : t('search.button')}
        </button>
      </form>

      <div className="chip-row" role="group" aria-label={t('search.quickSuggestions')}>
        {presets.map((preset) => {
          const label = lang === 'es' ? preset.es : preset.en;
          return (
            <button key={label} className="chip" type="button" onClick={() => { onQueryChange(label); onSearch(label); }}>
              {label}
            </button>
          );
        })}
      </div>

      <div aria-live="polite" aria-atomic="true">
        {message ? <p className="banner">{message}</p> : null}

        {!hasSearched && !isSearching ? (
          <p className="empty-state">{t('search.emptyState')}</p>
        ) : null}

        <div className="results-grid">
          {items.map((item) => (
            <ResultCard
              key={item.id}
              item={item}
              votingId={votingId}
              reasonPromptId={reasonPromptId}
              reasonText={reasonText}
              flaggingId={flaggingId}
              flagReasonText={flagReasonText}
              onVote={onVote}
              onReasonChange={onReasonChange}
              onReasonSubmit={onReasonSubmit}
              onReasonDismiss={onReasonDismiss}
              onFlagStart={onFlagStart}
              onFlagSubmit={onFlagSubmit}
              onFlagReasonChange={onFlagReasonChange}
              onFlagDismiss={onFlagDismiss}
            />
          ))}
        </div>

        {totalPages > 1 ? (
          <div className="pagination">
            <button
              type="button"
              className="secondary-button"
              disabled={page <= 1 || isSearching}
              onClick={() => onPageChange(page - 1)}
            >
              &larr;
            </button>
            <span className="pagination-info">
              {page} / {totalPages} ({total} {t('search.results')})
            </span>
            <button
              type="button"
              className="secondary-button"
              disabled={page >= totalPages || isSearching}
              onClick={() => onPageChange(page + 1)}
            >
              &rarr;
            </button>
          </div>
        ) : null}

        {aiLoading ? (
          <div className="ai-loading">
            <span className="ai-loading-spinner" />
            <span>{t('search.aiLoading', { seconds: aiCountdown })}</span>
          </div>
        ) : null}

        <AiSuggestionsSection
          suggestions={aiSuggestions}
          savingIndex={savingAiIndex}
          savedIndexes={savedAiIndexes}
          onSave={onSaveAiSuggestion}
        />
      </div>
    </section>
  );
}
