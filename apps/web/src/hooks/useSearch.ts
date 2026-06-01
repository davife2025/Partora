"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import type { SongSearchResult } from "@partora/types";

interface UseSearchReturn {
  query:    string;
  results:  SongSearchResult[];
  loading:  boolean;
  error:    string | null;
  setQuery: (q: string) => void;
  clear:    () => void;
}

const DEBOUNCE_MS = 350;
const MIN_CHARS   = 2;

export function useSearch(): UseSearchReturn {
  const [query,   setQueryState] = useState("");
  const [results, setResults]    = useState<SongSearchResult[]>([]);
  const [loading, setLoading]    = useState(false);
  const [error,   setError]      = useState<string | null>(null);
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef  = useRef<AbortController | null>(null);

  const doSearch = useCallback(async (q: string) => {
    // Cancel any in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    if (q.length < MIN_CHARS) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.get<{ results: SongSearchResult[] }>(
        `/api/search?q=${encodeURIComponent(q)}`
      );

      if (res.success && res.data) {
        setResults(res.data.results);
      } else {
        setError(res.error ?? "Search failed");
        setResults([]);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError("Search failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const setQuery = useCallback((q: string) => {
    setQueryState(q);
    if (timerRef.current) clearTimeout(timerRef.current);

    if (q.length < MIN_CHARS) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    timerRef.current = setTimeout(() => doSearch(q), DEBOUNCE_MS);
  }, [doSearch]);

  const clear = useCallback(() => {
    setQueryState("");
    setResults([]);
    setError(null);
    setLoading(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    abortRef.current?.abort();
  }, []);

  return { query, results, loading, error, setQuery, clear };
}
