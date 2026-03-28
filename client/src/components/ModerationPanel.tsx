import { useCallback, useEffect, useMemo, useState } from 'react';
import { TRPCClientError } from '@trpc/client';
import { createAdminClient } from '../api';
import { useTranslation } from '../i18n';
import type { ModerationLogEntry, ModerationQueueItem } from '../types';
import { readErrorMessage } from '../utils';

type Tab = 'queue' | 'log' | 'import';

const rejectionReasonValues = [
  'inaccurate_ratio',
  'inappropriate',
  'duplicate',
  'insufficient_info',
  'other',
] as const;

type RejectReason = (typeof rejectionReasonValues)[number];

export function ModerationPanel() {
  const { t } = useTranslation();
  const [token, setToken] = useState(() => sessionStorage.getItem('admin_token') ?? '');
  const [committedToken, setCommittedToken] = useState(() => sessionStorage.getItem('admin_token') ?? '');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tab, setTab] = useState<Tab>('queue');
  const [queue, setQueue] = useState<ModerationQueueItem[]>([]);
  const [queueTotal, setQueueTotal] = useState(0);
  const [logEntries, setLogEntries] = useState<ModerationLogEntry[]>([]);
  const [logTotal, setLogTotal] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<RejectReason>('inaccurate_ratio');
  const [rejectNotes, setRejectNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [importText, setImportText] = useState('');

  const adminClient = useMemo(() => (committedToken ? createAdminClient(committedToken) : null), [committedToken]);

  const loadQueue = useCallback(async () => {
    if (!adminClient) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await adminClient.moderation.queue.query({ status: 'pending', limit: 50 });
      setQueue(result.items);
      setQueueTotal(result.total);
      setIsAuthenticated(true);
    } catch (err) {
      setError(readErrorMessage(err));
      if (err instanceof TRPCClientError && err.data?.code === 'UNAUTHORIZED') {
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, [adminClient]);

  const loadLog = useCallback(async () => {
    if (!adminClient) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await adminClient.moderation.log.query({ limit: 50 });
      setLogEntries(result.entries);
      setLogTotal(result.total);
    } catch (err) {
      setError(readErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [adminClient]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (tab === 'queue') void loadQueue();
    if (tab === 'log') void loadLog();
  }, [tab, isAuthenticated, loadQueue, loadLog]);

  function handleConnect() {
    sessionStorage.setItem('admin_token', token);
    setCommittedToken(token);
    setIsAuthenticated(false);
    void loadQueue();
  }

  async function handleApprove(equivalentId: string) {
    if (!adminClient) return;
    setError(null);
    setMessage(null);
    try {
      const result = await adminClient.moderation.action.mutate({ equivalentId, action: 'approve' });
      setMessage(result.message);
      void loadQueue();
    } catch (err) {
      setError(readErrorMessage(err));
    }
  }

  async function handleReject(equivalentId: string) {
    if (!adminClient) return;
    setError(null);
    setMessage(null);
    try {
      const result = await adminClient.moderation.action.mutate({
        equivalentId,
        action: 'reject',
        reason: rejectReason,
        notes: rejectNotes || undefined,
      });
      setMessage(result.message);
      setRejectingId(null);
      setRejectNotes('');
      void loadQueue();
    } catch (err) {
      setError(readErrorMessage(err));
    }
  }

  async function handleTranslate() {
    if (!adminClient) return;
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      const result = await adminClient.moderation.translate.mutate();
      setMessage(result.message);
    } catch (err) {
      setError(readErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleImport() {
    if (!adminClient || !importText.trim()) return;
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      const entries = JSON.parse(importText);
      const result = await adminClient.moderation.import.mutate({ entries });
      setMessage(result.message);
      setImportText('');
    } catch (err) {
      setError(readErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <section className="panel moderation-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">{t('mod.eyebrow')}</p>
            <h2>{t('mod.heading')}</h2>
          </div>
        </div>
        <form
          className="search-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleConnect();
          }}
        >
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder={t('mod.tokenPlaceholder')}
            aria-label={t('mod.tokenPlaceholder')}
          />
          <button type="submit" disabled={!token}>{t('mod.connect')}</button>
        </form>
        {error ? <p className="banner danger" role="alert">{error}</p> : null}
      </section>
    );
  }

  return (
    <section className="panel moderation-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{t('mod.eyebrow')}</p>
          <h2>{t('mod.queueHeading')}</h2>
        </div>
      </div>

      <div className="chip-row" role="tablist">
        <button
          className={`chip ${tab === 'queue' ? 'chip-active' : ''}`}
          role="tab"
          aria-selected={tab === 'queue'}
          onClick={() => setTab('queue')}
        >
          {t('mod.pendingTab', { count: queueTotal })}
        </button>
        <button
          type="button"
          className="secondary-button"
          disabled={isLoading}
          onClick={() => void handleTranslate()}
        >
          {isLoading ? '...' : t('mod.translateMissing')}
        </button>
        <button
          className={`chip ${tab === 'log' ? 'chip-active' : ''}`}
          role="tab"
          aria-selected={tab === 'log'}
          onClick={() => setTab('log')}
        >
          {t('mod.logTab', { count: logTotal })}
        </button>
        <button
          className={`chip ${tab === 'import' ? 'chip-active' : ''}`}
          role="tab"
          aria-selected={tab === 'import'}
          onClick={() => setTab('import')}
        >
          {t('mod.importHeading')}
        </button>
      </div>

      {error ? <p className="banner danger" role="alert">{error}</p> : null}
      {message ? <p className="banner success" role="alert">{message}</p> : null}
      {isLoading ? <p className="empty-state">{t('mod.loading')}</p> : null}

      {tab === 'queue' && !isLoading ? (
        <div className="moderation-queue">
          {queue.length === 0 ? (
            <p className="empty-state">{t('mod.emptyQueue')}</p>
          ) : (
            queue.map((item) => (
              <article key={item.id} className="history-card">
                <header>
                  <strong>{item.displayFormat}</strong>
                  <span className={`status-chip ${item.status}`}>{item.status}</span>
                </header>
                <p>{item.description}</p>
                <small>
                  {t('mod.confidence', { score: item.confidenceScore })} | {t('mod.flags', { count: item.flaggedCount ?? 0 })}
                </small>

                {rejectingId === item.id ? (
                  <div className="reason-prompt">
                    <select
                      value={rejectReason}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (rejectionReasonValues.includes(val as RejectReason)) {
                          setRejectReason(val as RejectReason);
                        }
                      }}
                      aria-label={t('mod.rejectionReason')}
                    >
                      {rejectionReasonValues.map((value) => (
                        <option key={value} value={value}>{t(`mod.reason.${value}`)}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder={t('mod.optionalNotes')}
                      value={rejectNotes}
                      onChange={(e) => setRejectNotes(e.target.value)}
                      maxLength={500}
                    />
                    <div className="feedback-row">
                      <button type="button" className="secondary-button" onClick={() => void handleReject(item.id)}>
                        {t('mod.confirmReject')}
                      </button>
                      <button type="button" className="secondary-button" onClick={() => setRejectingId(null)}>
                        {t('search.cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="feedback-row">
                    <button type="button" className="secondary-button" onClick={() => void handleApprove(item.id)}>
                      {t('mod.approve')}
                    </button>
                    <button type="button" className="secondary-button" onClick={() => setRejectingId(item.id)}>
                      {t('mod.reject')}
                    </button>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      ) : null}

      {tab === 'log' && !isLoading ? (
        <div className="moderation-queue">
          {logEntries.length === 0 ? (
            <p className="empty-state">{t('mod.emptyLog')}</p>
          ) : (
            logEntries.map((entry) => (
              <article key={entry.id} className="history-card">
                <header>
                  <strong>{entry.action}</strong>
                  <span className={`status-chip ${entry.newStatus}`}>{entry.newStatus}</span>
                </header>
                <p>
                  {entry.previousStatus} &rarr; {entry.newStatus}
                  {entry.reason ? ` — ${entry.reason}` : null}
                </p>
                <small>{new Date(entry.createdAt).toLocaleString()}</small>
              </article>
            ))
          )}
        </div>
      ) : null}

      {tab === 'import' && !isLoading ? (
        <div className="moderation-queue">
          <textarea
            rows={10}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder={t('mod.importPlaceholder')}
          />
          <button
            type="button"
            className="secondary-button"
            disabled={!importText.trim()}
            onClick={() => void handleImport()}
          >
            {t('mod.importSubmit')}
          </button>
        </div>
      ) : null}
    </section>
  );
}
