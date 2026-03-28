import { useTranslation } from '../i18n';
import type { HistoryItem } from '../types';

interface ContributionHistoryProps {
  contributions: HistoryItem[];
}

export function ContributionHistory({ contributions }: ContributionHistoryProps) {
  const { t } = useTranslation();

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{t('history.eyebrow')}</p>
          <h2>{t('history.heading')}</h2>
        </div>
        <p className="panel-copy">{t('history.copy')}</p>
      </div>

      {contributions.length === 0 ? (
        <p className="empty-state">{t('history.empty')}</p>
      ) : (
        <div className="history-list">
          {contributions.map((item) => {
            const totalVotes = item.helpfulVotes + item.notHelpfulVotes;

            return (
              <article key={item.id} className="history-card">
                <header>
                  <div>
                    <strong>{item.displayFormat}</strong>
                    {item.bananaDisplayFormat ? (
                      <p className="banana-display">{item.bananaDisplayFormat}</p>
                    ) : null}
                  </div>
                  <span
                    className={`status-chip ${item.status}`}
                    title={t(`history.status.${item.status}`)}
                  >
                    {item.status}
                  </span>
                </header>
                <p>{item.description}</p>
                {item.status === 'rejected' && item.rejectionReason ? (
                  <p className="rejection-reason-display">{t('history.reason', { reason: item.rejectionReason })}</p>
                ) : null}
                <small>
                  {t('history.helpful', { count: item.helpfulVotes })}, {t('history.notHelpful', { count: item.notHelpfulVotes })}
                  {totalVotes > 0 ? ` (${t('history.votes', { count: totalVotes })})` : null}
                </small>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
