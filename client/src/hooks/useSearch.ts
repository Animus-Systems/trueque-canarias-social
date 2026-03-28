import { startTransition, useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api';
import type { AiSuggestion, SearchItem } from '../types';
import { readErrorMessage } from '../utils';

export function useSearch(setGlobalError: (msg: string | null) => void) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<SearchItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestion[]>([]);
  const [savingAiIndex, setSavingAiIndex] = useState<number | null>(null);
  const [savedAiIndexes, setSavedAiIndexes] = useState<Set<number>>(new Set());
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCountdown, setAiCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [lastQuery, setLastQuery] = useState('');

  const stopCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setAiCountdown(0);
    setAiLoading(false);
  }, []);

  const startCountdown = useCallback((seconds: number) => {
    stopCountdown();
    setAiLoading(true);
    setAiCountdown(seconds);
    countdownRef.current = setInterval(() => {
      setAiCountdown((prev) => {
        if (prev <= 1) {
          stopCountdown();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [stopCountdown]);

  useEffect(() => {
    return () => stopCountdown();
  }, [stopCountdown]);

  async function doSearch(searchValue: string, searchPage = 1): Promise<void> {
    setIsSearching(true);
    setGlobalError(null);

    try {
      const response = await api.equivalents.search.query({
        search: searchValue,
        page: searchPage,
        pageSize: 10,
      });

      startTransition(() => {
        setItems(response.items);
        setPage(response.page);
        setTotalPages(response.totalPages);
        setTotal(response.total);
        setLastQuery(searchValue);
        if (searchPage === 1) {
          setAiSuggestions([]);
          setSavedAiIndexes(new Set());
        }
        setMessage(response.message);
      });

      if (searchPage === 1 && (response.items.length === 0 || response.isComplexQuery) && searchValue.trim()) {
        startCountdown(40);
        void api.ai.suggestions.query({ query: searchValue }).then((aiResponse) => {
          stopCountdown();
          startTransition(() => {
            setAiSuggestions(aiResponse.suggestions);
            if (aiResponse.message) {
              setMessage(aiResponse.message);
            }
          });
        }).catch(() => {
          stopCountdown();
        });
      }
    } catch (error) {
      setGlobalError(readErrorMessage(error));
    } finally {
      setIsSearching(false);
    }
  }

  function handleSearch(searchValue: string) {
    void doSearch(searchValue, 1);
  }

  function handlePageChange(newPage: number) {
    void doSearch(lastQuery, newPage);
  }

  async function handleSaveAiSuggestion(suggestion: AiSuggestion): Promise<void> {
    const index = aiSuggestions.indexOf(suggestion);
    setSavingAiIndex(index);
    setGlobalError(null);

    try {
      const response = await api.ai.save.mutate({
        skillNameEn: suggestion.skillNameEn,
        skillNameEs: suggestion.skillNameEs,
        itemNameEn: suggestion.itemNameEn,
        itemNameEs: suggestion.itemNameEs,
        ratio: suggestion.ratio,
        offerUnit: suggestion.offerUnit,
        receiveUnit: suggestion.receiveUnit,
        bananaValue: suggestion.bananaValue,
        descriptionEn: suggestion.descriptionEn,
        descriptionEs: suggestion.descriptionEs,
      });

      startTransition(() => {
        setMessage(response.message);
        if (response.success && index >= 0) {
          setSavedAiIndexes((prev) => new Set(prev).add(index));
        }
      });
    } catch (error) {
      setGlobalError(readErrorMessage(error));
    } finally {
      setSavingAiIndex(null);
    }
  }

  function updateItem(id: string, updates: Partial<SearchItem>) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  return {
    query, setQuery, items, message, setMessage, isSearching,
    aiSuggestions, savingAiIndex, savedAiIndexes,
    aiLoading, aiCountdown,
    page, totalPages, total,
    handleSearch, handlePageChange, handleSaveAiSuggestion, updateItem, removeItem,
  };
}
