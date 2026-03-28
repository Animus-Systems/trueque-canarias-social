import { startTransition, useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import type { HistoryItem, SessionInfo } from '../types';
import { readErrorMessage } from '../utils';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useSession() {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const init = useCallback(async () => {
    const maxRetries = 2;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const [nextSession, nextHistory] = await Promise.all([
          api.session.get.query(),
          api.contributions.history.query(),
        ]);
        startTransition(() => {
          setSession(nextSession);
          setHistory(nextHistory.contributions);
          setError(null);
        });
        return;
      } catch (err) {
        if (attempt < maxRetries) {
          await delay(1000 * (attempt + 1));
        } else {
          setError(readErrorMessage(err));
        }
      }
    }
  }, []);

  useEffect(() => {
    void init();
  }, [init]);

  function updateReputation(reputation: number) {
    setSession((prev) => prev ? { ...prev, reputation } : prev);
  }

  function addContribution(contribution: HistoryItem) {
    setHistory((prev) => [contribution, ...prev]);
  }

  return { session, history, error, setError, updateReputation, addContribution };
}
