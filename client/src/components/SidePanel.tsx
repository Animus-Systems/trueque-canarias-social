import { useState } from 'react';
import { useTranslation } from '../i18n';
import type { HistoryItem } from '../types';
import { ContributionForm } from './ContributionForm';
import { ContributionHistory } from './ContributionHistory';
import { ModerationPanel } from './ModerationPanel';

type Tab = 'contribute' | 'history' | 'moderation';

interface SidePanelProps {
  isSubmitting: boolean;
  submitMessage: string | null;
  submitWarning: string | null;
  onSubmit: (input: {
    skillName: string;
    itemName: string;
    ratio: number;
    offerUnit?: 'hour' | 'kg' | 'unit' | 'dozen' | 'liter';
    receiveUnit?: 'hour' | 'kg' | 'unit' | 'dozen' | 'liter';
    description: string;
    bananaValue?: number | null;
  }) => Promise<boolean>;
  contributions: HistoryItem[];
}

export function SidePanel({
  isSubmitting,
  submitMessage,
  submitWarning,
  onSubmit,
  contributions,
}: SidePanelProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('contribute');

  return (
    <section className="panel">
      <div className="side-panel-tabs" role="tablist">
        <button
          className={`side-tab ${tab === 'contribute' ? 'side-tab-active' : ''}`}
          role="tab"
          aria-selected={tab === 'contribute'}
          onClick={() => setTab('contribute')}
        >
          {t('form.eyebrow')}
        </button>
        <button
          className={`side-tab ${tab === 'history' ? 'side-tab-active' : ''}`}
          role="tab"
          aria-selected={tab === 'history'}
          onClick={() => setTab('history')}
        >
          {t('history.eyebrow')}
        </button>
        <button
          className={`side-tab ${tab === 'moderation' ? 'side-tab-active' : ''}`}
          role="tab"
          aria-selected={tab === 'moderation'}
          onClick={() => setTab('moderation')}
        >
          {t('mod.eyebrow')}
        </button>
      </div>

      <div className="side-panel-content">
        {tab === 'contribute' ? (
          <ContributionForm
            isSubmitting={isSubmitting}
            message={submitMessage}
            warning={submitWarning}
            onSubmit={onSubmit}
          />
        ) : null}

        {tab === 'history' ? (
          <ContributionHistory contributions={contributions} />
        ) : null}

        {tab === 'moderation' ? (
          <ModerationPanel />
        ) : null}
      </div>
    </section>
  );
}
