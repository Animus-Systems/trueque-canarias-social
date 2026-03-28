import { useTranslation } from '../i18n';
import type { SearchItem } from '../types';

function confidenceTone(score: number): string {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

interface ResultCardProps {
  item: SearchItem;
  votingId: string | null;
  reasonPromptId: string | null;
  reasonText: string;
  flaggingId: string | null;
  flagReasonText: string;
  onVote: (equivalentId: string, voteType: 'helpful' | 'not_helpful', reason?: string) => void;
  onReasonChange: (text: string) => void;
  onReasonSubmit: (equivalentId: string) => void;
  onReasonDismiss: () => void;
  onFlagStart: (equivalentId: string) => void;
  onFlagSubmit: (equivalentId: string, reason: string) => void;
  onFlagReasonChange: (text: string) => void;
  onFlagDismiss: () => void;
}

export function ResultCard({
  item,
  votingId,
  reasonPromptId,
  reasonText,
  flaggingId,
  flagReasonText,
  onVote,
  onReasonChange,
  onReasonSubmit,
  onReasonDismiss,
  onFlagStart,
  onFlagSubmit,
  onFlagReasonChange,
  onFlagDismiss,
}: ResultCardProps) {
  const { t } = useTranslation();

  return (
    <article className="result-card">
      <div className="result-main">
        <div>
          <h3>{item.displayFormat}</h3>
          {item.bananaDisplayFormat ? (
            <p className="banana-display">{item.bananaDisplayFormat}</p>
          ) : null}
          <p>{item.description}</p>
        </div>
        <span
          className={`confidence-pill ${confidenceTone(item.confidenceScore)}`}
          title={`${item.helpfulVotes} ${t('search.helpful').toLowerCase()}, ${item.notHelpfulVotes} ${t('search.notHelpful').toLowerCase()}`}
        >
          {t('search.confidence', { score: item.confidenceScore })}
        </span>
        {item.sourceType ? (
          <span className={`source-badge source-${item.sourceType}`}>
            {item.sourceType === 'official' && t('search.sourceOfficial')}
            {item.sourceType === 'community' && t('search.sourceCommunity')}
            {item.sourceType === 'ai_suggested' && t('search.sourceAi')}
          </span>
        ) : null}
      </div>

      <dl className="result-meta">
        <div>
          <dt>{t('search.helpfulVotes')}</dt>
          <dd>{item.helpfulVotes}</dd>
        </div>
        <div>
          <dt>{t('search.notHelpful')}</dt>
          <dd>{item.notHelpfulVotes}</dd>
        </div>
        <div>
          <dt>{t('search.status')}</dt>
          <dd>{item.status}</dd>
        </div>
      </dl>

      <div className="feedback-row">
        <button
          type="button"
          className="secondary-button"
          disabled={votingId === item.id}
          aria-label={t('search.markHelpful', { name: item.displayFormat })}
          onClick={() => onVote(item.id, 'helpful')}
        >
          {t('search.helpful')}
        </button>
        <button
          type="button"
          className="secondary-button"
          disabled={votingId === item.id}
          aria-label={t('search.markNotHelpful', { name: item.displayFormat })}
          onClick={() => onVote(item.id, 'not_helpful')}
        >
          {t('search.notHelpful')}
        </button>
      </div>

      {reasonPromptId === item.id ? (
        <div className="reason-prompt" role="region" aria-label={t('search.feedbackReason')}>
          <label>
            <span className="sr-only">{t('search.whyNotHelpful')}</span>
            <input
              type="text"
              placeholder={t('search.optionalReason')}
              value={reasonText}
              onChange={(e) => onReasonChange(e.target.value)}
              maxLength={300}
            />
          </label>
          <div className="feedback-row">
            <button type="button" className="secondary-button" onClick={() => onReasonSubmit(item.id)}>
              {t('search.send')}
            </button>
            <button type="button" className="secondary-button" onClick={onReasonDismiss}>
              {t('search.skip')}
            </button>
          </div>
        </div>
      ) : null}

      {flaggingId === item.id ? (
        <div className="reason-prompt" role="region" aria-label={t('search.flagRegion')}>
          <label>
            <span className="sr-only">{t('search.whyFlag')}</span>
            <input
              type="text"
              placeholder={t('search.whyFlag')}
              value={flagReasonText}
              onChange={(e) => onFlagReasonChange(e.target.value)}
              maxLength={300}
            />
          </label>
          <div className="feedback-row">
            <button
              type="button"
              className="secondary-button"
              disabled={flagReasonText.length < 5}
              onClick={() => onFlagSubmit(item.id, flagReasonText)}
            >
              {t('search.submitFlag')}
            </button>
            <button type="button" className="secondary-button" onClick={onFlagDismiss}>
              {t('search.cancel')}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="flag-button"
          aria-label={t('search.flagLabel', { name: item.displayFormat })}
          onClick={() => onFlagStart(item.id)}
        >
          {t('search.flagForReview')}
        </button>
      )}
    </article>
  );
}
