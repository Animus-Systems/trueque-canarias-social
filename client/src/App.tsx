import { startTransition, useState } from 'react';
import { api } from './api';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { SearchPanel } from './components/SearchPanel';
import { SidePanel } from './components/SidePanel';
import { useFeedback } from './hooks/useFeedback';
import { useSearch } from './hooks/useSearch';
import { useSession } from './hooks/useSession';
import { useTranslation } from './i18n';
import { readErrorMessage } from './utils';

export default function App() {
  const { t } = useTranslation();
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitWarning, setSubmitWarning] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sessionState = useSession();
  const search = useSearch((msg) => setGlobalError(msg));
  const feedback = useFeedback({
    updateItem: search.updateItem,
    removeItem: search.removeItem,
    setMessage: search.setMessage,
    setGlobalError,
  });

  const combinedError = globalError ?? sessionState.error;

  const reputationLabel = sessionState.session
    ? t('app.reputationLabel', { count: sessionState.session.reputation })
    : t('app.reputationLoading');

  async function handleSubmit(input: {
    skillName: string;
    itemName: string;
    ratio: number;
    offerUnit?: 'hour' | 'kg' | 'unit' | 'dozen' | 'liter';
    receiveUnit?: 'hour' | 'kg' | 'unit' | 'dozen' | 'liter';
    description: string;
    bananaValue?: number | null;
  }): Promise<boolean> {
    setIsSubmitting(true);
    setGlobalError(null);

    try {
      const response = await api.equivalents.submit.mutate(input);

      startTransition(() => {
        setSubmitMessage(response.message);
        setSubmitWarning(response.warning);
        if (response.success) {
          sessionState.updateReputation(response.reputation);
          if (response.contribution) {
            sessionState.addContribution(response.contribution);
          }
        }
      });

      return response.success;
    } catch (error) {
      setGlobalError(readErrorMessage(error));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="app-shell">
      <main id="main-content" className="app-layout">
        <section className="hero">
          <div>
            <img src="/logo.webp" alt={t('app.eyebrow')} className="hero-logo" />
            <p className="eyebrow">{t('app.eyebrow')}</p>
            <h1>{t('app.title')}</h1>
            <p className="hero-copy">{t('app.heroCopy')}</p>
          </div>
          <aside className="hero-card">
            <span className="hero-card-label">{t('app.sessionReputation')}</span>
            <strong>{reputationLabel}</strong>
            <small>{t('app.sessionNote')}</small>
            <div className="hero-card-actions">
              <LanguageSwitcher />
              <nav className="social-links" aria-label="External links">
                <a href="https://github.com/Animus-Systems/trueque-canarias-social" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                </a>
                <a href="https://www.canarias.social" target="_blank" rel="noopener noreferrer" aria-label="Canarias Social" title="Canarias Social">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                </a>
              </nav>
            </div>
          </aside>
        </section>

        {combinedError ? <p className="banner danger" role="alert">{combinedError}</p> : null}

        <div className="two-column-grid">
          <SearchPanel
            query={search.query}
            isSearching={search.isSearching}
            items={search.items}
            aiSuggestions={search.aiSuggestions}
            message={search.message}
            votingId={feedback.votingId}
            reasonPromptId={feedback.reasonPromptId}
            reasonText={feedback.reasonText}
            flaggingId={feedback.flaggingId}
            flagReasonText={feedback.flagReasonText}
            savingAiIndex={search.savingAiIndex}
            savedAiIndexes={search.savedAiIndexes}
            aiLoading={search.aiLoading}
            aiCountdown={search.aiCountdown}
            page={search.page}
            totalPages={search.totalPages}
            total={search.total}
            onQueryChange={search.setQuery}
            onSearch={search.handleSearch}
            onPageChange={search.handlePageChange}
            onVote={feedback.handleVote}
            onReasonChange={feedback.setReasonText}
            onReasonSubmit={feedback.handleReasonSubmit}
            onReasonDismiss={feedback.handleReasonDismiss}
            onFlagStart={feedback.handleFlagStart}
            onFlagSubmit={feedback.handleFlag}
            onFlagReasonChange={feedback.setFlagReasonText}
            onFlagDismiss={feedback.handleFlagDismiss}
            onSaveAiSuggestion={search.handleSaveAiSuggestion}
          />

          <SidePanel
            isSubmitting={isSubmitting}
            submitMessage={submitMessage}
            submitWarning={submitWarning}
            onSubmit={handleSubmit}
            contributions={sessionState.history}
          />
        </div>
      </main>
    </div>
  );
}
